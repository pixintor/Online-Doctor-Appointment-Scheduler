const patientService =
  require("../services/patient.Service");


exports.getMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const patient =
      await patientService.getMyProfile(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};


exports.updateMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const patient =
      await patientService.updateMyProfile(
        req.user._id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Patient profile updated successfully",
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMyAccount = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await patientService.updateMyAccount(
        req.user._id,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Patient account updated successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyAppointments = async (
  req,
  res,
  next
) => {
  try {
    const appointments =
      await patientService.getMyAppointments(
        req.user._id
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


exports.getUpcomingAppointments =
  async (req, res, next) => {
    try {
      const appointments =
        await patientService
          .getUpcomingAppointments(
            req.user._id
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


exports.getAppointmentHistory =
  async (req, res, next) => {
    try {
      const appointments =
        await patientService
          .getAppointmentHistory(
            req.user._id
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


exports.getAllPatients = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await patientService.getAllPatients(
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


exports.getPatientById = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await patientService.getPatientById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivatePatient = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await patientService
        .deactivatePatient(
          req.params.id
        );

    res.status(200).json({
      success: true,
      message:
        "Patient account deactivated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.activatePatient = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await patientService
        .activatePatient(
          req.params.id
        );

    res.status(200).json({
      success: true,
      message:
        "Patient account activated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientAppointmentStats =
  async (req, res, next) => {
    try {
      const stats =
        await patientService
          .getPatientAppointmentStats(
            req.params.id
          );

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

