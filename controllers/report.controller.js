const reportService =
  require("../services/reportService");

exports.getSummaryReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await reportService.getSummary();

    res.status(200).json({
      success: true,
      data: report
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
    const report =
      await reportService.getAppointmentReport(
        req.query
      );

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getDailyAppointmentReport =
  async (req, res, next) => {
    try {
      const report =
        await reportService
          .getDailyAppointmentReport(
            req.query.date
          );

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
      await reportService.getDoctorReport(
        req.query
      );

    res.status(200).json({
      success: true,
      count: report.length,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await reportService.getPatientReport();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getSpecialtyReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await reportService.getSpecialtyReport();

    res.status(200).json({
      success: true,
      count: report.length,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await reportService.getMonthlyReport(
        req.query.year
      );

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompletionRate = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await reportService.getCompletionRate(
        req.query
      );

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.getPopularSpecialties =
  async (req, res, next) => {
    try {
      const report =
        await reportService
          .getPopularSpecialties(
            req.query.limit
          );

      res.status(200).json({
        success: true,
        count: report.length,
        data: report
      });
    } catch (error) {
      next(error);
    }
  };



