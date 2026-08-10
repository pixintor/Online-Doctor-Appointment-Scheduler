const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

const buildDateFilter = (
  startDate,
  endDate
) => {
  const filter = {};

  if (!startDate && !endDate) {
    return filter;
  }

  filter.appointmentDate = {};

  if (startDate) {
    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
      throw new Error(
        "Invalid start date"
      );
    }

    start.setHours(0, 0, 0, 0);

    filter.appointmentDate.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);

    if (isNaN(end.getTime())) {
      throw new Error(
        "Invalid end date"
      );
    }

    end.setHours(
      23,
      59,
      59,
      999
    );

    filter.appointmentDate.$lte = end;
  }

  return filter;
};

exports.getSummary = async () => {
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
      },

      {
        $sort: {
          count: -1
        }
      }
    ]);

  const statusSummary = {};

  appointmentStatus.forEach(
    (item) => {
      statusSummary[item._id] =
        item.count;
    }
  );

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers
    },

    doctors: totalDoctors,

    patients: totalPatients,

    appointments: {
      total: totalAppointments,
      pending:
        statusSummary.pending || 0,
      confirmed:
        statusSummary.confirmed || 0,
      rejected:
        statusSummary.rejected || 0,
      cancelled:
        statusSummary.cancelled || 0,
      completed:
        statusSummary.completed || 0
    }
  };
};

exports.getAppointmentReport = async ({
  startDate,
  endDate,
  doctor,
  status
} = {}) => {
  const match = {
    ...buildDateFilter(
      startDate,
      endDate
    )
  };

  if (doctor) {
    match.doctor = doctor;
  }

  if (status) {
    match.status = status;
  }

  const total =
    await Appointment.countDocuments(
      match
    );

  const byStatus =
    await Appointment.aggregate([
      {
        $match: match
      },

      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          count: -1
        }
      }
    ]);

  const byDate =
    await Appointment.aggregate([
      {
        $match: match
      },

      {
        $group: {
          _id: "$appointmentDate",
          count: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          _id: 1
        }
      }
    ]);

  return {
    total,
    byStatus,
    byDate
  };
};

exports.getDailyAppointmentReport = async (
  date
) => {
  const selectedDate = date
    ? new Date(date)
    : new Date();

  if (isNaN(selectedDate.getTime())) {
    throw new Error(
      "Invalid date"
    );
  }

  selectedDate.setHours(
    0,
    0,
    0,
    0
  );

  const nextDate =
    new Date(selectedDate);

  nextDate.setDate(
    nextDate.getDate() + 1
  );

  const appointments =
    await Appointment.find({
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDate
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

  const summary = {
    total: appointments.length,

    pending: appointments.filter(
      (appointment) =>
        appointment.status ===
        "pending"
    ).length,

    confirmed: appointments.filter(
      (appointment) =>
        appointment.status ===
        "confirmed"
    ).length,

    completed: appointments.filter(
      (appointment) =>
        appointment.status ===
        "completed"
    ).length,

    cancelled: appointments.filter(
      (appointment) =>
        appointment.status ===
        "cancelled"
    ).length,

    rejected: appointments.filter(
      (appointment) =>
        appointment.status ===
        "rejected"
    ).length
  };

  return {
    date: selectedDate,
    summary,
    appointments
  };
};

exports.getDoctorReport = async ({
  startDate,
  endDate
} = {}) => {
  const match = {
    ...buildDateFilter(
      startDate,
      endDate
    )
  };

  const report =
    await Appointment.aggregate([
      {
        $match: match
      },

      {
        $group: {
          _id: "$doctor",

          totalAppointments: {
            $sum: 1
          },

          pendingAppointments: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "pending"
                  ]
                },
                1,
                0
              ]
            }
          },

          confirmedAppointments: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "confirmed"
                  ]
                },
                1,
                0
              ]
            }
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
          },

          rejectedAppointments: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "rejected"
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
            $trim: {
              input: {
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
              }
            }
          },

          specialty:
            "$doctor.specialty",

          totalAppointments: 1,

          pendingAppointments: 1,

          confirmedAppointments: 1,

          completedAppointments: 1,

          cancelledAppointments: 1,

          rejectedAppointments: 1
        }
      },

      {
        $sort: {
          totalAppointments: -1
        }
      }
    ]);

  return report;
};

exports.getPatientReport = async () => {
  const [
    totalPatients,
    activePatients,
    inactivePatients
  ] = await Promise.all([
    Patient.countDocuments(),

    User.countDocuments({
      role: "patient",
      isActive: true
    }),

    User.countDocuments({
      role: "patient",
      isActive: false
    })
  ]);

  const appointmentsPerPatient =
    await Appointment.aggregate([
      {
        $group: {
          _id: "$patient",

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
        $sort: {
          totalAppointments: -1
        }
      }
    ]);

  return {
    patients: {
      total: totalPatients,
      active: activePatients,
      inactive: inactivePatients
    },

    appointmentsPerPatient
  };
};

exports.getSpecialtyReport = async () => {
  const report =
    await Appointment.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctor"
        }
      },

      {
        $unwind: "$doctor"
      },

      {
        $group: {
          _id: "$doctor.specialty",

          totalAppointments: {
            $sum: 1
          },

          pendingAppointments: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "pending"
                  ]
                },
                1,
                0
              ]
            }
          },

          confirmedAppointments: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "confirmed"
                  ]
                },
                1,
                0
              ]
            }
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
        $project: {
          _id: 0,

          specialty: "$_id",

          totalAppointments: 1,

          pendingAppointments: 1,

          confirmedAppointments: 1,

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

  return report;
};

exports.getMonthlyReport = async (
  year = new Date().getFullYear()
) => {
  year = Number(year);

  if (
    Number.isNaN(year) ||
    year < 2000 ||
    year > 2100
  ) {
    throw new Error(
      "Invalid year"
    );
  }

  const startDate =
    new Date(
      `${year}-01-01T00:00:00.000Z`
    );

  const endDate =
    new Date(
      `${year + 1}-01-01T00:00:00.000Z`
    );

  const report =
    await Appointment.aggregate([
      {
        $match: {
          appointmentDate: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },

      {
        $group: {
          _id: {
            month: {
              $month:
                "$appointmentDate"
            },

            status: "$status"
          },

          count: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          "_id.month": 1
        }
      }
    ]);

  return {
    year,
    report
  };
};

exports.getCompletionRate = async ({
  startDate,
  endDate
} = {}) => {
  const match = {
    ...buildDateFilter(
      startDate,
      endDate
    )
  };

  const result =
    await Appointment.aggregate([
      {
        $match: match
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: 1
          },

          completed: {
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
          }
        }
      }
    ]);

  if (!result.length) {
    return {
      total: 0,
      completed: 0,
      completionRate: 0
    };
  }

  const total = result[0].total;
  const completed = result[0].completed;

  const completionRate =
    total > 0
      ? Number(
          (
            (completed / total) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    total,
    completed,
    completionRate
  };
};

exports.getPopularSpecialties = async (
  limit = 10
) => {
  limit = Number(limit);

  if (
    Number.isNaN(limit) ||
    limit < 1
  ) {
    limit = 10;
  }

  const report =
    await Appointment.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctor"
        }
      },

      {
        $unwind: "$doctor"
      },

      {
        $group: {
          _id: "$doctor.specialty",

          appointmentCount: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          appointmentCount: -1
        }
      },

      {
        $limit: limit
      },

      {
        $project: {
          _id: 0,

          specialty: "$_id",

          appointmentCount: 1
        }
      }
    ]);

  return report;
};

module.exports = {
  getSummary: exports.getSummary,
  getAppointmentReport:
    exports.getAppointmentReport,
  getDailyAppointmentReport:
    exports.getDailyAppointmentReport,
  getDoctorReport:
    exports.getDoctorReport,
  getPatientReport:
    exports.getPatientReport,
  getSpecialtyReport:
    exports.getSpecialtyReport,
  getMonthlyReport:
    exports.getMonthlyReport,
  getCompletionRate:
    exports.getCompletionRate,
  getPopularSpecialties:
    exports.getPopularSpecialties
};

