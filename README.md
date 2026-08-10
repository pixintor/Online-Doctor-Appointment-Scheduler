## Online Doctor Appointment Scheduler

A lightweight REST API for scheduling doctor appointments, with role-based access control and JWT authentication.

Create a `.env` file in the project root. See [Configuration](#configuration).

Run the app in development mode:

```bash
npm run dev
```

Run the app in production mode:

```bash
npm start
```

## Configuration

Create a `.env` file with these variables (example values shown):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/appointments
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## API examples

Authentication

- Register: `POST /api/auth/register`
  - Body (JSON): `firstName`, `lastName`, `email`, `password`, `phone`, `role`

Example curl:

```bash
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Abdulwahab","lastName":"Lawal","email":"abdulwahab@example.com","password":"password123","phone":"1234567890","role":"patient"}'
```

- Login: `POST /api/auth/login`
  - Body (JSON): `email`, `password`
  - Response includes a `token` to use in the `Authorization` header

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

Using the token (example GET doctors):

```bash
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/doctors
```

Doctor endpoints

- Create profile (doctor only): `POST /api/doctors/profile` (protected)
- List doctors: `GET /api/doctors`
- Get doctor: `GET /api/doctors/:id`

Schedules

- List schedules for a doctor (public): `GET /api/schedules/:doctorId`
- Create schedule (doctor only): `POST /api/schedules` (protected)
- Update schedule (doctor only): `PUT /api/schedules/:id` (protected)

Create schedule example:

```bash
curl -s -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"day":"Monday","startTime":"09:00","endTime":"12:00"}'
```

## Appointments

This project includes appointment booking support. Key appointment endpoints:

- Book appointment (patient): `POST /api/appointments` (protected)
- Get patient appointments (patient): `GET /api/appointments/me` (protected)
- Get doctor appointments (doctor): `GET /api/appointments/doctor` (protected)
- Update appointment status (doctor): `PUT /api/appointments/:id/status` (protected)
- Cancel appointment (patient): `DELETE /api/appointments/:id` (protected)

Book appointment example:

```bash
curl -s -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"doctorId":"<DOCTOR_ID>","appointmentDate":"2026-08-01","appointmentTime":"10:30","reason":"Consultation"}'
```

Get my appointments (patient):

```bash
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/appointments/me
```

Get doctor appointments (doctor):

```bash
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/appointments/doctor
```

Update appointment status (doctor):

```bash
curl -s -X PUT http://localhost:5000/api/appointments/<APPOINTMENT_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status":"confirmed"}'
```

Cancel appointment (patient):

```bash
curl -s -X DELETE http://localhost:5000/api/appointments/<APPOINTMENT_ID> \
  -H "Authorization: Bearer <TOKEN>"
```
