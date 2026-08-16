import transporter from "../config/mail.js";

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Medical Appointment System" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

const sendAppointmentBookedEmail = async (appointment) => {
  const patient = appointment.patient;
  const doctor = appointment.doctor;
  const doctorUser = doctor.user;

  await sendEmail({
    to: patient.email,
    subject: "Appointment Request Received",
    html: `
      <h2>Appointment Request Received</h2>

      <p>Hello ${patient.firstName} ${patient.lastName},</p>

      <p>
        Your appointment request has been successfully submitted.
      </p>

      <h3>Appointment Details</h3>

      <p><strong>Doctor:</strong> Dr. ${doctorUser.firstName} ${doctorUser.lastName}</p>
      <p><strong>Specialization:</strong> ${doctor.specialization}</p>
      <p><strong>Hospital:</strong> ${doctor.hospital}</p>
      <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
      <p><strong>Reason:</strong> ${appointment.reason}</p>
      <p><strong>Status:</strong> Pending</p>

      <p>
        Your appointment is currently awaiting confirmation from the doctor.
      </p>

      <p>Thank you.</p>
    `,
  });
};

const sendDoctorNewAppointmentEmail = async (appointment) => {
  const patient = appointment.patient;
  const doctorUser = appointment.doctor.user;

  await sendEmail({
    to: doctorUser.email,
    subject: "New Appointment Request",
    html: `
      <h2>New Appointment Request</h2>

      <p>
        Hello Dr. ${doctorUser.firstName} ${doctorUser.lastName},
      </p>

      <p>
        You have received a new appointment request.
      </p>

      <h3>Appointment Details</h3>

      <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
      <p><strong>Phone:</strong> ${patient.phone}</p>
      <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
      <p><strong>Reason:</strong> ${appointment.reason}</p>
      <p><strong>Status:</strong> Pending</p>

      <p>Please log into the system to review this appointment request.</p>
    `,
  });
};

const sendAppointmentStatusEmail = async (appointment) => {
  const patient = appointment.patient;
  const doctorUser = appointment.doctor.user;

  const statusMessages = {
    accepted: {
      subject: "Appointment Confirmed",
      message: "Your appointment has been accepted by the doctor.",
    },

    rejected: {
      subject: "Appointment Rejected",
      message: "Unfortunately, your appointment request has been rejected by the doctor.",
    },

    completed: {
      subject: "Appointment Completed",
      message: "Your appointment has been marked as completed.",
    },

    cancelled: {
      subject: "Appointment Cancelled",
      message: "Your appointment has been cancelled.",
    },
  };

  const statusInfo = statusMessages[appointment.status];

  if (!statusInfo) return;

  await sendEmail({
    to: patient.email,
    subject: statusInfo.subject,
    html: `
      <h2>${statusInfo.subject}</h2>

      <p>
        Hello ${patient.firstName} ${patient.lastName},
      </p>

      <p>${statusInfo.message}</p>

      <h3>Appointment Details</h3>

      <p><strong>Doctor:</strong> Dr. ${doctorUser.firstName} ${doctorUser.lastName}</p>
      <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
      <p><strong>Status:</strong> ${appointment.status}</p>

      <p>Thank you.</p>
    `,
  });
};

const sendAppointmentCancellationEmail = async (appointment) => {
  const patient = appointment.patient;
  const doctorUser = appointment.doctor.user;

  await sendEmail({
    to: doctorUser.email,
    subject: "Appointment Cancelled",
    html: `
      <h2>Appointment Cancelled</h2>

      <p>
        Hello Dr. ${doctorUser.firstName} ${doctorUser.lastName},
      </p>

      <p>
        The following appointment has been cancelled by the patient.
      </p>

      <h3>Appointment Details</h3>

      <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
      <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
      <p><strong>Reason:</strong> ${appointment.reason}</p>

      <p><strong>Status:</strong> Cancelled</p>
    `,
  });
};

export default {
  sendAppointmentBookedEmail,
  sendDoctorNewAppointmentEmail,
  sendAppointmentStatusEmail,
  sendAppointmentCancellationEmail,
};