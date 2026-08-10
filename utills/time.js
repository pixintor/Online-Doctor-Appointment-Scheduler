export const isTimeWithinRange = (appointmentTime, startTime, endTime) => {
  return appointmentTime >= startTime && appointmentTime <= endTime;
};
