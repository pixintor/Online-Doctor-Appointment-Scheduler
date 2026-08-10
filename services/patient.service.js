const User = require("../models/User");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

exports.getMyProfile = async (userId) => {
  const patient = await Patient.findOne({
    user: userId
  }).populate(
    "user",
    "firstName lastName email phone role isActive"
  );

  if (!patient) {
    const error = new Error(
      "Patient profile not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return patient;
};

exports.updateMyProfile = async (
  userId,
  data
) => {
  const patient = await Patient.findOne({
    user: userId
  });

  if (!patient) {
    const error = new Error(
      "Patient profile not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const allowedFields = [
    "dateOfBirth",
    "gender",
    "address",
    "bloodGroup",
    "emergencyContact",
    "medicalHistory",
    "allergies"
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      patient[field] = data[field];
    }
  });

  await patient.save();

  return Patient.findById(
    patient._id
  ).populate(
    "user",
    "firstName lastName email phone role isActive"
  );
};

exports.updateMyAccount = async (
  userId,
  data
) => {
  const user = await User.findById(
    userId
  );

  if (!user) {
    const error = new Error(
      "User account not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "phone"
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  });

  await user.save();

  return User.findById(
    user._id
  ).select(
    "firstName lastName email phone role isActive"
  );
};

exports.getMyAppointments = async (
  userId
) => {
  const patient = await Patient.findOne({
    user: userId
  });

  if (!patient) {
    const error = new Error(
      "Patient profile not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const appointments =
    await Appointment.find({
      patient: patient._id
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

  return appointments;
};

exports.getUpcomingAppointments = async (
  userId
) => {
  const patient = await Patient.findOne({
    user: userId
  });

  if (!patient) {
    const error = new Error(
      "Patient profile not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const now = new Date();

  const appointments =
    await Appointment.find({
      patient: patient._id,

      appointmentDate: {
        $gte: now
      },

      status: {
        $in: [
          "pending",
          "confirmed"
        ]
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

  return appointments;
};

exports.getAppointmentHistory = async (
  userId
) => {
  const patient = await Patient.findOne({
    user: userId
  });

  if (!patient) {
    const error = new Error(
      "Patient profile not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const appointments =
    await Appointment.find({
      patient: patient._id,

      $or: [
        {
          status: {
            $in: [
              "completed",
              "cancelled",
              "rejected"
            ]
          }
        },

        {
          appointmentDate: {
            $lt: new Date()
          }
        }
      ]
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
        appointmentDate: -1
      });

  return appointments;
};

exports.getAllPatients = async ({
  page = 1,
  limit = 20,
  search
} = {}) => {
  page = Math.max(
    Number(page) || 1,
    1
  );

  limit = Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  );

  const skip =
    (page - 1) * limit;

  const userFilter = {
    role: "patient"
  };

  if (search) {
    const regex = new RegExp(
      search.trim(),
      "i"
    );

    userFilter.$or = [
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
  
  const users = await User.find(
    userFilter
  ).select("_id");

  const userIds = users.map(
    (user) => user._id
  );

  const patientFilter = {
    user: {
      $in: userIds
    }
  };

  const [
    patients,
    total
  ] = await Promise.all([
    Patient.find(patientFilter)
      .populate(
        "user",
        "firstName lastName email phone role isActive createdAt"
      )
      .sort({
        createdAt: -1
      })
      .skip(skip)
      .limit(limit),

    Patient.countDocuments(
      patientFilter
    )
  ]);

  return {
    patients,

    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(
        total / limit
      )
    }
  };
};

exports.getPatientById = async (
  patientId
) => {
  const patient =
    await Patient.findById(
      patientId
    ).populate(
      "user",
      "firstName lastName email phone role isActive createdAt"
    );

  if (!patient) {
    const error = new Error(
      "Patient not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const appointmentCount =
    await Appointment.countDocuments({
      patient: patient._id
    });

  return {
    patient,
    appointmentCount
  };
};

exports.deactivatePatient = async (
  patientId
) => {
  const patient =
    await Patient.findById(
      patientId
    );

  if (!patient) {
    const error = new Error(
      "Patient not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const user =
    await User.findById(
      patient.user
    );

  if (!user) {
    const error = new Error(
      "Patient user account not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (!user.isActive) {
    const error = new Error(
      "Patient account is already deactivated"
    );

    error.statusCode = 400;

    throw error;
  }

  user.isActive = false;

  await user.save();

  return {
    patientId: patient._id,
    userId: user._id,
    isActive: user.isActive
  };
};

exports.activatePatient = async (
  patientId
) => {
  const patient =
    await Patient.findById(
      patientId
    );

  if (!patient) {
    const error = new Error(
      "Patient not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const user =
    await User.findById(
      patient.user
    );

  if (!user) {
    const error = new Error(
      "Patient user account not found"
    );

    error.statusCode = 404;

    throw error;
  }

  user.isActive = true;

  await user.save();

  return {
    patientId: patient._id,
    userId: user._id,
    isActive: user.isActive
  };
};

exports.getPatientAppointmentStats =
  async (patientId) => {
    const patient =
      await Patient.findById(
        patientId
      );

    if (!patient) {
      const error = new Error(
        "Patient not found"
      );

      error.statusCode = 404;

      throw error;
    }

    const stats =
      await Appointment.aggregate([
        {
          $match: {
            patient: patient._id
          }
        },

        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1
            }
          }
        }
      ]);

    const result = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };

    stats.forEach((item) => {
      result[item._id] =
        item.count;

      result.total +=
        item.count;
    });

    return result;
  };

exports.patientExists = async (
  userId
) => {
  const patient =
    await Patient.findOne({
      user: userId
    }).select("_id");

  return Boolean(patient);
};
}
