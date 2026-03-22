import z from "zod";

export const monitorSchema = z.object({
  device_id: z.string("incorrect format for 'username'")
    .startsWith("device-", "'username' must be in format: 'device-xxx'")
    .length(10, "'username' must be in format: 'device-xxx'"),

  timeout: z
    .number("incorrect format for 'timeout'")
    .multipleOf(1, "'timeout' must be a whole number")
    .gte(1, "'timeout' must be between 1 and 86400").lte(86400, "'timeout' must be between 1 and 86400"),

  alert_email: z.email("incorrect format for 'alert_email'"),
  
  last_ping: z.date().optional()
})

export type Monitor = z.infer<typeof monitorSchema>;