const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Schedule = require("../models/Schedule");
const Appointment = require("../models/Appointment");

const {
  hashPassword
} = require("../utils/password");


exports.registerPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    } = req.body;

    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase()
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists"
        });
      }
    }

    const patientEmail =
      email ||
      `emergency-${Date.now()}@hospital.local`;

    const patientPassword =
      password ||
      `Temp@${Date.now()}`;

    const hashedPassword =
      await hashPassword(patientPassword);

    const user = await User.create({
      firstName,
      lastName,
      email: patientEmail,
      phone,
      password: hashedPassword,
      role: "patient"
    });

    try {
      const patient = await Patient.create({
        user: user._id,
        dateOfBirth,
        gender,
        address,
        emergencyContact
      });

      res.status(201).json({
        success: true,
        message: "Patient registered successfully",
        data: {
          patient,
          account: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role
          },

          temporaryCredentials: !email
            ? {
                email: patientEmail,
                password: patientPassword
              }
            : undefined
        }
      });
    } catch (error) {
    
      await User.findByIdAndDelete(user._id);

      throw error;
    }
  } catch (error) {
    next(error);
  }
};


exports.getAppointments = async (
  req,
  res,
  next
) => {
  try {
    const {
      date,
      status,
      doctor,
      patient
    } = req.query;

    const filter = {};

    
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
      endDate.setDate(endDate.getDate() + 1);

      filter.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

   
    if (status) {
      filter.status = status;
    }

    
    if (doctor) {
      filter.doctor = doctor;
    }

    
    if (patient) {
      filter.patient = patient;
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
          appointmentDate: 1,
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


exports.getAppointmentById = async (
  req,
  res,
  next
) => {
  try {
    const appointment =
      await Appointment.findById(req.params.id)
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
        });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};


exports.getDoctorCalendar = async (
  req,
  res,
  next
) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findById(
      doctorId
    ).populate(
      "user",
      "firstName lastName email phone isActive"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    
    let dayOfWeek;

    if (date) {
      const requestedDate = new Date(date);

      if (isNaN(requestedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format"
        });
      }

      dayOfWeek = requestedDate.toLocaleDateString(
        "en-US",
        {
          weekday: "long"
        }
      );
    }

    const scheduleFilter = {
      doctor: doctorId,
      isAvailable: true
    };

    if (dayOfWeek) {
      scheduleFilter.dayOfWeek = dayOfWeek;
    }

    const schedules =
      await Schedule.find(scheduleFilter)
        .sort({
          startTime: 1
        });

    
    let appointments = [];

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(
        endDate.getDate() + 1
      );

      appointments =
        await Appointment.find({
          doctor: doctorId,

          appointmentDate: {
            $gte: startDate,
            $lt: endDate
          }
        })
          .populate({
            path: "patient",
            populate: {
              path: "user",
              select:
                "firstName lastName phone"
            }
          })
          .sort({
            startTime: 1
          });
    }

    res.status(200).json({
      success: true,
      data: {
        doctor,
        date: date || null,
        dayOfWeek: dayOfWeek || null,
        schedules,
        appointments
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.getTodaysAppointments = async (
  req,
  res,
  next
) => {
  try {
    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);

    endDate.setDate(
      endDate.getDate() + 1
    );

    const appointments =
      await Appointment.find({
        appointmentDate: {
          $gte: startDate,
          $lt: endDate
        }
      })
        .populate({
          path: "patient",
          populate: {
            path: "user",
            select:
              "firstName lastName phone"
          }
        })
        .populate({
          path: "doctor",
          populate: {
            path: "user",
            select:
              "firstName lastName"
          }
        })
        .sort({
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


exports.getAppointmentSlip = async (
  req,
  res,
  next
) => {
  try {
    const appointment =
      await Appointment.findById(req.params.id)
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
        });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    const patientUser =
      appointment.patient?.user;

    const doctorUser =
      appointment.doctor?.user;

  
    const slip = {
      appointmentId: appointment._id,

      patient: {
        name: patientUser
          ? `${patientUser.firstName} ${patientUser.lastName}`
          : "N/A",

        phone:
          patientUser?.phone || "N/A",

        email:
          patientUser?.email || "N/A"
      },

      doctor: {
        name: doctorUser
          ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}`
          : "N/A",

        specialty:
          appointment.doctor?.specialty ||
          "N/A"
      },

      appointment: {
        date: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        reason: appointment.reason,
        status: appointment.status
      },

      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: "Appointment slip generated successfully",
      data: slip
    });
  } catch (error) {
    next(error);
  }
};

exports.searchPatients = async (
  req,
  res,
  next
) => {
  try {
    const { search } = req.query;

    if (!search || search.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Search term must contain at least 2 characters"
      });
    }

    const regex = new RegExp(
      search.trim(),
      "i"
    );

    const users = await User.find({
      role: "patient",

      $or: [
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
      ]
    }).select(
      "firstName lastName email phone isActive"
    );

    const userIds = users.map(
      (user) => user._id
    );

    const patients = await Patient.find({
      user: {
        $in: userIds
      }
    }).populate(
      "user",
      "firstName lastName email phone isActive"
    );

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

