const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Schedule = require("../models/Schedule");

exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      role,
      isActive,
      search
    } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      const regex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        {
          firstName: regex
        },
        {
          lastName: regex
        },
        {
          email: regex
        },
        {
          phone: regex
        }
      ];
    }

    const users = await User.find(filter)
      .select(
        "firstName lastName email phone role isActive createdAt updatedAt"
      )
      .sort({
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select(
      "firstName lastName email phone role isActive createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateUser = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (
      user._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own account"
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already deactivated"
      });
    }

    user.isActive = false;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "User deactivated successfully",
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.activateUser = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already active"
      });
    }

    user.isActive = true;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "User activated successfully",
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDoctors = async (
  req,
  res,
  next
) => {
  try {
    const {
      specialty,
      isActive
    } = req.query;

    const doctorFilter = {};

    if (specialty) {
      doctorFilter.specialty = {
        $regex: specialty,
        $options: "i"
      };
    }

    const doctors = await Doctor.find(
      doctorFilter
    )
      .populate(
        "user",
        "firstName lastName email phone isActive"
      )
      .sort({
        createdAt: -1
      });

    let filteredDoctors = doctors;

    if (isActive !== undefined) {
      const activeValue =
        isActive === "true";

      filteredDoctors = doctors.filter(
        (doctor) =>
          doctor.user &&
          doctor.user.isActive === activeValue
      );
    }

    res.status(200).json({
      success: true,
      count: filteredDoctors.length,
      data: filteredDoctors
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (
  req,
  res,
  next
) => {
  try {
    const doctor = await Doctor.findById(
      req.params.id
    ).populate(
      "user",
      "firstName lastName email phone role isActive"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const schedules = await Schedule.find({
      doctor: doctor._id
    }).sort({
      dayOfWeek: 1,
      startTime: 1
    });

    res.status(200).json({
      success: true,
      data: {
        doctor,
        schedules
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createDoctor = async (
  req,
  res,
  next
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      specialty,
      licenseNumber,
      qualification,
      yearsOfExperience,
      consultationFee,
      bio
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !specialty ||
      !licenseNumber ||
      !qualification
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required doctor information is missing"
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase()
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "A user with this email already exists"
      });
    }

    const existingDoctor =
      await Doctor.findOne({
        licenseNumber
      });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message:
          "A doctor with this license number already exists"
      });
    }

    const bcrypt = require("bcryptjs");

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "doctor"
    });

    try {

      const doctor =
        await Doctor.create({
          user: user._id,
          specialty,
          licenseNumber,
          qualification,
          yearsOfExperience:
            yearsOfExperience || 0,
          consultationFee:
            consultationFee || 0,
          bio: bio || ""
        });

      const populatedDoctor =
        await Doctor.findById(
          doctor._id
        ).populate(
          "user",
          "firstName lastName email phone role isActive"
        );

      res.status(201).json({
        success: true,
        message:
          "Doctor created successfully",
        data: populatedDoctor
      });
    } catch (error) {
    
      await User.findByIdAndDelete(
        user._id
      );

      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.updateDoctor = async (
  req,
  res,
  next
) => {
  try {
    const {
      specialty,
      licenseNumber,
      qualification,
      yearsOfExperience,
      consultationFee,
      bio
    } = req.body;

    const doctor =
      await Doctor.findById(
        req.params.id
      );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (
      licenseNumber &&
      licenseNumber !==
        doctor.licenseNumber
    ) {
      const licenseExists =
        await Doctor.findOne({
          licenseNumber,
          _id: {
            $ne: doctor._id
          }
        });

      if (licenseExists) {
        return res.status(409).json({
          success: false,
          message:
            "License number already belongs to another doctor"
        });
      }

      doctor.licenseNumber =
        licenseNumber;
    }

    if (specialty !== undefined) {
      doctor.specialty = specialty;
    }

    if (qualification !== undefined) {
      doctor.qualification =
        qualification;
    }

    if (
      yearsOfExperience !== undefined
    ) {
      doctor.yearsOfExperience =
        yearsOfExperience;
    }

    if (
      consultationFee !== undefined
    ) {
      doctor.consultationFee =
        consultationFee;
    }

    if (bio !== undefined) {
      doctor.bio = bio;
    }

    await doctor.save();

    const updatedDoctor =
      await Doctor.findById(
        doctor._id
      ).populate(
        "user",
        "firstName lastName email phone role isActive"
      );

    res.status(200).json({
      success: true,
      message:
        "Doctor updated successfully",
      data: updatedDoctor
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDoctor = async (
  req,
  res,
  next
) => {
  try {
    const doctor =
      await Doctor.findById(
        req.params.id
      );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const user =
      await User.findByIdAndUpdate(
        doctor.user,
        {
          isActive: false
        },
        {
          new: true
        }
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor user account not found"
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Doctor account deactivated successfully"
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPatients = async (
  req,
  res,
  next
) => {
  try {
    const patients =
      await Patient.find()
        .populate(
          "user",
          "firstName lastName email phone isActive createdAt"
        )
        .sort({
          createdAt: -1
        });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientById = async (
  req,
  res,
  next
) => {
  try {
    const patient =
      await Patient.findById(
        req.params.id
      ).populate(
        "user",
        "firstName lastName email phone role isActive createdAt"
      );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const appointmentCount =
      await Appointment.countDocuments({
        patient: patient._id
      });

    res.status(200).json({
      success: true,
      data: {
        patient,
        appointmentCount
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAppointments = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      doctor,
      patient,
      date
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (doctor) {
      filter.doctor = doctor;
    }

    if (patient) {
      filter.patient = patient;
    }

    if (date) {
      const startDate = new Date(date);

      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format"
        });
      }

      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);

      endDate.setDate(
        endDate.getDate() + 1
      );

      filter.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const appointments =
      await Appointment.find(filter)
        .populate({
          path: "patient",
          populate: {
            path: "user",
            select:
              "firstName lastName email phone"
          }
        })
        .populate({
          path: "doctor",
          populate: {
            path: "user",
            select:
              "firstName lastName email phone"
          }
        })
        .sort({
          appointmentDate: -1,
          startTime: 1
        });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

exports.getSummaryReport = async (
  req,
  res,
  next
) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "doctor"
      }),

      User.countDocuments({
        role: "patient"
      }),

      Appointment.countDocuments(),

      User.countDocuments({
        isActive: true
      }),

      User.countDocuments({
        isActive: false
      })
    ]);

    const appointmentStatus =
      await Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1
            }
          }
        }
      ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers
        },

        doctors: totalDoctors,

        patients: totalPatients,

        appointments: {
          total: totalAppointments,
          byStatus: appointmentStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentReport = async (
  req,
  res,
  next
) => {
  try {
    const {
      startDate,
      endDate
    } = req.query;

    const match = {};

    if (startDate || endDate) {
      match.appointmentDate = {};

      if (startDate) {
        const start =
          new Date(startDate);

        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid start date"
          });
        }

        start.setHours(0, 0, 0, 0);

        match.appointmentDate.$gte =
          start;
      }

      if (endDate) {
        const end =
          new Date(endDate);

        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid end date"
          });
        }

        end.setHours(23, 59, 59, 999);

        match.appointmentDate.$lte =
          end;
      }
    }

    const report =
      await Appointment.aggregate([
        {
          $match: match
        },

        {
          $group: {
            _id: "$status",
            total: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            total: -1
          }
        }
      ]);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await Appointment.aggregate([
        {
          $group: {
            _id: "$doctor",
            totalAppointments: {
              $sum: 1
            },

            completedAppointments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "completed"
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            cancelledAppointments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "cancelled"
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },

        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctor"
          }
        },

        {
          $unwind: {
            path: "$doctor",
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $lookup: {
            from: "users",
            localField: "doctor.user",
            foreignField: "_id",
            as: "user"
          }
        },

        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },

        {
          $project: {
            _id: 1,

            doctorName: {
              $concat: [
                {
                  $ifNull: [
                    "$user.firstName",
                    ""
                  ]
                },
                " ",
                {
                  $ifNull: [
                    "$user.lastName",
                    ""
                  ]
                }
              ]
            },

            specialty:
              "$doctor.specialty",

            totalAppointments: 1,

            completedAppointments: 1,

            cancelledAppointments: 1
          }
        },

        {
          $sort: {
            totalAppointments: -1
          }
        }
      ]);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

