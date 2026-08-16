const doctorService =
  require("../services/doctor.service");


exports.getAllDoctors = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await doctorService.getAllDoctors(
        req.query
      );

    res.status(200).json({
      success: true,
      ...result
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
    const doctor =
      await doctorService.getDoctorById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};


exports.getMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const doctor =
      await doctorService
        .getDoctorByUserId(
          req.user._id
        );

    res.status(200).json({
      success: true,
      data: doctor
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
    const doctor =
      await doctorService.createDoctor(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Doctor created successfully",
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};


exports.updateDoctorProfile =
  async (req, res, next) => {
    try {
      const doctor =
        await doctorService
          .updateDoctorProfile(
            req.params.id,
            req.body
          );

      res.status(200).json({
        success: true,
        message:
          "Doctor profile updated successfully",
        data: doctor
      });
    } catch (error) {
      next(error);
    }
  };


exports.updateDoctorAccount =
  async (req, res, next) => {
    try {
      const user =
        await doctorService
          .updateDoctorAccount(
            req.user._id,
            req.body
          );

      res.status(200).json({
        success: true,
        message:
          "Doctor account updated successfully",
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

exports.searchBySpecialty = async (
  req,
  res,
  next
) => {
  try {
    const doctors =
      await doctorService
        .searchBySpecialty(
          req.query.specialty
        );

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorSchedule = async (
  req,
  res,
  next
) => {
  try {
    const schedules =
      await doctorService
        .getDoctorSchedule(
          req.params.id
        );

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

exports.setAvailability = async (
  req,
  res,
  next
) => {
  try {
    const doctor =
      await doctorService
        .getDoctorByUserId(
          req.user._id
        );

    const schedule =
      await doctorService
        .setAvailability(
          doctor._id,
          req.body
        );

    res.status(201).json({
      success: true,
      message:
        "Availability created successfully",
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAvailability =
  async (req, res, next) => {
    try {
      const doctor =
        await doctorService
          .getDoctorByUserId(
            req.user._id
          );

      const schedule =
        await doctorService
          .updateAvailability(
            doctor._id,
            req.params.scheduleId,
            req.body
          );

      res.status(200).json({
        success: true,
        message:
          "Availability updated successfully",
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  };

exports.deleteAvailability =
  async (req, res, next) => {
    try {
      const doctor =
        await doctorService
          .getDoctorByUserId(
            req.user._id
          );

      const schedule =
        await doctorService
          .deleteAvailability(
            doctor._id,
            req.params.scheduleId
          );

      res.status(200).json({
        success: true,
        message:
          "Availability removed successfully",
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  };

exports.getDailySchedule = async (
  req,
  res,
  next
) => {
  try {
    const doctor =
      await doctorService
        .getDoctorByUserId(
          req.user._id
        );

    const result =
      await doctorService
        .getDailySchedule(
          doctor._id,
          req.query.date
        );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorAppointments =
  async (req, res, next) => {
    try {
      const doctor =
        await doctorService
          .getDoctorByUserId(
            req.user._id
          );

      const appointments =
        await doctorService
          .getDoctorAppointments(
            doctor._id,
            req.query
          );

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  };

exports.activateDoctor = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await doctorService
        .activateDoctor(
          req.params.id
        );

    res.status(200).json({
      success: true,
      message:
        "Doctor account activated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateDoctor = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await doctorService
        .deactivateDoctor(
          req.params.id
        );

    res.status(200).json({
      success: true,
      message:
        "Doctor account deactivated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

