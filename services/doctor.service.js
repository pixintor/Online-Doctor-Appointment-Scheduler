const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Schedule = require("../models/Schedule");
const Appointment = require("../models/Appointment");

exports.getAllDoctors = async ({
  page = 1,
  limit = 20,
  specialty,
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
    role: "doctor",
    isActive: true
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
      }
    ];
  }

  const users = await User.find(
    userFilter
  ).select("_id");

  const userIds = users.map(
    (user) => user._id
  );

  const doctorFilter = {
    user: {
      $in: userIds
    }
  };

  if (specialty) {
    doctorFilter.specialty = {
      $regex: specialty.trim(),
      $options: "i"
    };
  }

  const [
    doctors,
    total
  ] = await Promise.all([
    Doctor.find(doctorFilter)
      .populate(
        "user",
        "firstName lastName email phone isActive"
      )
      .sort({
        createdAt: -1
      })
      .skip(skip)
      .limit(limit),

    Doctor.countDocuments(
      doctorFilter
    )
  ]);

  return {
    doctors,

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

exports.getDoctorById = async (
  doctorId
) => {
  const doctor =
    await Doctor.findById(
      doctorId
    ).populate(
      "user",
      "firstName lastName email phone role isActive"
    );

  if (!doctor) {
    const error = new Error(
      "Doctor not found"
    );

    error.statusCode = 404;

    throw error;
  }

  if (
    !doctor.user ||
    !doctor.user.isActive
  ) {
    const error = new Error(
      "Doctor account is inactive"
    );

    error.statusCode = 404;

    throw error;
  }

  return doctor;
};

exports.getDoctorByUserId = async (
  userId
) => {
  const doctor =
    await Doctor.findOne({
      user: userId
    }).populate(
      "user",
      "firstName lastName email phone role isActive"
    );

  if (!doctor) {
    const error = new Error(
      "Doctor profile not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return doctor;
};

exports.createDoctor = async (
  data
) => {
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
  } = data;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !specialty ||
    !licenseNumber ||
    !qualification
  ) {
    const error = new Error(
      "Required doctor information is missing"
    );

    error.statusCode = 400;

    throw error;
  }

  const normalizedEmail =
    email.toLowerCase().trim();

  const existingUser =
    await User.findOne({
      email: normalizedEmail
    });

  if (existingUser) {
    const error = new Error(
      "A user with this email already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  const existingDoctor =
    await Doctor.findOne({
      licenseNumber
    });

  if (existingDoctor) {
    const error = new Error(
      "A doctor with this license number already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
    password: hashedPassword,
    role: "doctor",
    isActive: true
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

    return Doctor.findById(
      doctor._id
    ).populate(
      "user",
      "firstName lastName email phone role isActive"
    );
  } catch (error) {
    await User.findByIdAndDelete(
      user._id
    );

    throw error;
  }
};

exports.updateDoctorProfile = async (
  doctorId,
  data
) => {
  const doctor =
    await Doctor.findById(
      doctorId
    );

  if (!doctor) {
    const error = new Error(
      "Doctor not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const allowedFields = [
    "specialty",
    "licenseNumber",
    "qualification",
    "yearsOfExperience",
    "consultationFee",
    "bio"
  ];

  for (
    const field of allowedFields
  ) {
    if (data[field] !== undefined) {
      doctor[field] =
        data[field];
    }
  }

  if (
    data.licenseNumber &&
    data.licenseNumber !==
      doctor.licenseNumber
  ) {
    const existingDoctor =
      await Doctor.findOne({
        licenseNumber:
          data.licenseNumber,

        _id: {
          $ne: doctor._id
        }
      });

    if (existingDoctor) {
      const error = new Error(
        "License number already belongs to another doctor"
      );

      error.statusCode = 409;

      throw error;
    }
  }

  await doctor.save();

  return Doctor.findById(
    doctor._id
  ).populate(
    "user",
    "firstName lastName email phone role isActive"
  );
};

exports.updateDoctorAccount = async (
  userId,
  data
) => {
  const user =
    await User.findById(
      userId
    );

  if (!user) {
    const error = new Error(
      "Doctor user account not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const allowedFields = [
    "firstName",
    "lastName",
    "phone"
  ];

  allowedFields.forEach(
    (field) => {
      if (
        data[field] !== undefined
      ) {
        user[field] =
          data[field];
      }
    }
  );

  await user.save();

  return User.findById(
    user._id
  ).select(
    "firstName lastName email phone role isActive"
  );
};

exports.searchBySpecialty = async (
  specialty
) => {
  if (
    !specialty ||
    !specialty.trim()
  ) {
    const error = new Error(
      "Specialty is required"
    );

    error.statusCode = 400;

    throw error;
  }

  const doctors =
    await Doctor.find({
      specialty: {
        $regex: specialty.trim(),
        $options: "i"
      }
    })
      .populate({
        path: "user",
        match: {
          role: "doctor",
          isActive: true
        },
        select:
          "firstName lastName email phone isActive"
      })
      .sort({
        specialty: 1
      });

  return doctors.filter(
    (doctor) => doctor.user
  );
};

exports.getDoctorSchedule = async (
  doctorId
) => {
  const doctor =
    await Doctor.findById(
      doctorId
    );

  if (!doctor) {
    const error = new Error(
      "Doctor not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const schedules =
    await Schedule.find({
      doctor: doctorId,
      isActive: true
    }).sort({
      dayOfWeek: 1,
      startTime: 1
    });

  return schedules;
};

exports.setAvailability = async (
  doctorId,
  data
) => {
  const {
    dayOfWeek,
    startTime,
    endTime,
    slotDuration = 30
  } = data;

  if (
    !dayOfWeek ||
    !startTime ||
    !endTime
  ) {
    const error = new Error(
      "Day, start time and end time are required"
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    startTime >= endTime
  ) {
    const error = new Error(
      "End time must be later than start time"
    );

    error.statusCode = 400;

    throw error;
  }

  const validDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];

  const normalizedDay =
    dayOfWeek.toLowerCase();

  if (
    !validDays.includes(
      normalizedDay
    )
  ) {
    const error = new Error(
      "Invalid day of week"
    );

    error.statusCode = 400;

    throw error;
  }

  const doctor =
    await Doctor.findById(
      doctorId
    );

  if (!doctor) {
    const error = new Error(
      "Doctor not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const existingSchedules =
    await Schedule.find({
      doctor: doctorId,
      dayOfWeek: normalizedDay,
      isActive: true
    });

  const overlaps =
    existingSchedules.some(
      (schedule) =>
        startTime <
          schedule.endTime &&
        endTime >
          schedule.startTime
    );

  if (overlaps) {
    const error = new Error(
      "The new schedule overlaps an existing schedule"
    );

    error.statusCode = 409;

    throw error;
  }

  const schedule =
    await Schedule.create({
      doctor: doctorId,
      dayOfWeek: normalizedDay,
      startTime,
      endTime,
      slotDuration,
      isActive: true
    });

  return schedule;
};

exports.updateAvailability = async (
  doctorId,
  scheduleId,
  data
) => {
  const schedule =
    await Schedule.findOne({
      _id: scheduleId,
      doctor: doctorId
    });

  if (!schedule) {
    const error = new Error(
      "Schedule not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const {
    dayOfWeek,
    startTime,
    endTime,
    slotDuration,
    isActive
  } = data;

  if (dayOfWeek) {
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    ];

    const normalizedDay =
      dayOfWeek.toLowerCase();

    if (
      !validDays.includes(
        normalizedDay
      )
    ) {
      const error = new Error(
        "Invalid day of week"
      );

      error.statusCode = 400;

      throw error;
    }

    schedule.dayOfWeek =
      normalizedDay;
  }

  if (startTime !== undefined) {
    schedule.startTime =
      startTime;
  }

  if (endTime !== undefined) {
    schedule.endTime =
      endTime;
  }

  if (
    schedule.startTime >=
    schedule.endTime
  ) {
    const error = new Error(
      "End time must be later than start time"
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    slotDuration !== undefined
  ) {
    schedule.slotDuration =
      slotDuration;
  }

  if (
    isActive !== undefined
  ) {
    schedule.isActive =
      isActive;
  }

  const existingSchedules =
    await Schedule.find({
      doctor: doctorId,
      dayOfWeek:
        schedule.dayOfWeek,
      isActive: true,
      _id: {
        $ne: schedule._id
      }
    });

  const overlaps =
    existingSchedules.some(
      (item) =>
        schedule.startTime <
          item.endTime &&
        schedule.endTime >
          item.startTime
    );

  if (overlaps) {
    const error = new Error(
      "The updated schedule overlaps an existing schedule"
    );

    error.statusCode = 409;

    throw error;
  }

  await schedule.save();

  return schedule;
};

exports.deleteAvailability = async (
  doctorId,
  scheduleId
) => {
  const schedule =
    await Schedule.findOne({
      _id: scheduleId,
      doctor: doctorId
    });

  if (!schedule) {
    const error = new Error(
      "Schedule not found"
    );

    error.statusCode = 404;

    throw error;
  }

  schedule.isActive = false;

  await schedule.save();

  return schedule;
};

exports.getDailySchedule = async (
  doctorId,
  date
) => {
  const selectedDate = date
    ? new Date(date)
    : new Date();

  if (
    isNaN(
      selectedDate.getTime()
    )
  ) {
    const error = new Error(
      "Invalid date"
    );

    error.statusCode = 400;

    throw error;
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
      doctor: doctorId,

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
            "firstName lastName phone email"
        }
      })
      .sort({
        startTime: 1
      });

  return {
    date: selectedDate,
    appointments
  };
};

exports.getDoctorAppointments = async (
  doctorId,
  {
    status,
    startDate,
    endDate
  } = {}
) => {
  const filter = {
    doctor: doctorId
  };

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.appointmentDate = {};

    if (startDate) {
      const start =
        new Date(startDate);

      if (
        isNaN(
          start.getTime()
        )
      ) {
        const error = new Error(
          "Invalid start date"
        );

        error.statusCode = 400;

        throw error;
      }

      start.setHours(
        0,
        0,
        0,
        0
      );

      filter.appointmentDate.$gte =
        start;
    }

    if (endDate) {
      const end =
        new Date(endDate);

      if (
        isNaN(
          end.getTime()
        )
      ) {
        const error = new Error(
          "Invalid end date"
        );

        error.statusCode = 400;

        throw error;
      }

      end.setHours(
        23,
        59,
        59,
        999
      );

      filter.appointmentDate.$lte =
        end;
    }
  }

  const appointments =
    await Appointment.find(filter)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select:
            "firstName lastName phone email"
        }
      })
      .sort({
        appointmentDate: 1,
        startTime: 1
      });

  return appointments;
};

exports.activateDoctor = async (
  doctorId
) => {
  const doctor =
    await Doctor.findById(
      doctorId
    );

  if (!doctor) {
    const error = new Error(
      "Doctor not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const user =
    await User.findById(
      doctor.user
    );

  if (!user) {
    const error = new Error(
      "Doctor user account not found"
    );

    error.statusCode = 404;

    throw error;
  }

  user.isActive = true;

  await user.save();

  return {
    doctorId: doctor._id,
    userId: user._id,
    isActive: user.isActive
  };
};

exports.deactivateDoctor = async (
  doctorId
) => {
  const doctor =
    await Doctor.findById(
      doctorId
    );

  if (!doctor) {
    const error = new Error(
      "Doctor not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const user =
    await User.findById(
      doctor.user
    );

  if (!user) {
    const error = new Error(
      "Doctor user account not found"
    );

    error.statusCode = 404;

    throw error;
  }

  user.isActive = false;

  await user.save();

  await Schedule.updateMany(
    {
      doctor: doctorId
    },
    {
      isActive: false
    }
  );

  return {
    doctorId: doctor._id,
    userId: user._id,
    isActive: user.isActive
  };
};

exports.doctorExists = async (
  doctorId
) => {
  const doctor =
    await Doctor.findById(
      doctorId
    ).select("_id");

  return Boolean(doctor);
};

exports.getAvailableDoctors = async () => {
  const doctors =
    await Doctor.find()
      .populate({
        path: "user",
        match: {
          role: "doctor",
          isActive: true
        },
        select:
          "firstName lastName email phone isActive"
      });

  return doctors.filter(
    (doctor) => doctor.user
  );
};


