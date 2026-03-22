import z from "zod";

export const deviceIDSchema = z.string("incorrect format for 'device_id'")
      .startsWith("device-", "'device_id' must be in format: 'device-xxx'")
      .length(10, "'device_id' must be in format: 'device-xxx'")

export const monitorSchema = z.object({
  device_id: deviceIDSchema,
  timeout: z
    .number("incorrect format for 'timeout'")
    .multipleOf(1, "'timeout' must be a whole number")
    .gte(1, "'timeout' must be between 1 and 10,080").lte(10080, "'timeout' must be between 1 and 10,080"),
  alert_email: z.email("incorrect format for 'alert_email'"),
  deadline: z.date().optional(),
  status: z.string().optional()
})

export type Monitor = z.infer<typeof monitorSchema>;
export type DeviceID = z.infer<typeof deviceIDSchema>;