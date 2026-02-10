import { ClipboardIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const bookingType = defineType({
  name: "booking",
  title: "Booking",
  type: "document",
  icon: ClipboardIcon,
  description: "User class bookings with attendance tracking",
  fields: [
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "userProfile" }],
      description: "Reference to the user profile",
      validation: (Rule) => Rule.required().error("User is required"),
    }),
    defineField({
      name: "classSession",
      type: "reference",
      to: [{ type: "classSession" }],
      description: "The class session being booked",
      validation: (Rule) => Rule.required().error("Class session is required"),
    }),
    defineField({
      name: "status",
      type: "string",
      description: "Current status of the booking",
      options: {
        list: [
          { title: "Confirmed", value: "confirmed" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Attended", value: "attended" },
          { title: "No Show", value: "noShow" },
        ],
        layout: "radio",
      },
      initialValue: "confirmed",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      description: "When the booking was created",
      readOnly: true,
    }),
    defineField({
      name: "cancelledAt",
      type: "datetime",
      description: "When the booking was cancelled",
      readOnly: true,
      hidden: ({ document }) => document?.status !== "cancelled",
    }),
    defineField({
      name: "attendedAt",
      type: "datetime",
      description: "When the user confirmed attendance",
      readOnly: true,
      hidden: ({ document }) => document?.status !== "attended",
    }),
    defineField({
      name: "reminder24hSentAt",
      title: "24 Hour Reminder Sent At",
      type: "datetime",
      description: "Timestamp when the 24-hour reminder email was sent",
      readOnly: true,
    }),
    defineField({
      name: "reminder1hSentAt",
      title: "1 Hour Reminder Sent At",
      type: "datetime",
      description: "Timestamp when the 1-hour reminder email was sent",
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Created, Recent First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      userFirstName: "user.firstName",
      userLastName: "user.lastName",
      userEmail: "user.email",
      activityName: "classSession.activity.name",
      venueName: "classSession.venue.name",
      startTime: "classSession.startTime",
      status: "status",
    },
    prepare({
      userFirstName,
      userLastName,
      userEmail,
      activityName,
      venueName,
      startTime,
      status,
    }) {
      const userName =
        [userFirstName, userLastName].filter(Boolean).join(" ") ||
        userEmail ||
        "Unknown user";
      const date = startTime
        ? new Date(startTime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "No date";

      const statusEmoji: Record<string, string> = {
        confirmed: "✓",
        cancelled: "✗",
        attended: "✓✓",
        noShow: "⚠",
      };

      return {
        title: `${statusEmoji[status] || ""} ${activityName || "No activity"}`,
        subtitle: `${userName} • ${venueName || ""} • ${date}`,
      };
    },
  },
});
