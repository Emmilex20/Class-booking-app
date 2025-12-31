import { defineField, defineType, defineArrayMember } from "sanity";
import { CommentIcon } from "@sanity/icons";

export const classRequestType = defineType({
  name: "classRequest",
  title: "Class Request",
  type: "document",
  icon: CommentIcon,
  description: "Requests submitted by users asking for new classes/venues/schedules",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Class Name",
      validation: (Rule) => Rule.required().error("Please provide a name for the requested class"),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "instructor",
      title: "Suggested Instructor",
      type: "string",
    }),
    defineField({
      name: "duration",
      title: "Duration (minutes)",
      type: "number",
      validation: (Rule) => Rule.min(10).max(480),
    }),
    defineField({
      name: "categoryName",
      title: "Category (optional)",
      type: "string",
      description: "Free-text category name. Admin can map this to existing categories when approving.",
    }),
    defineField({
      name: "suggestedVenue",
      title: "Suggested Venue",
      type: "object",
      fields: [
        { name: "name", type: "string", title: "Venue name" },
        { name: "address", type: "string", title: "Venue address" },
        { name: "venueRef", type: "reference", to: [{ type: "venue" }], title: "Existing venue reference" },
      ],
    }),
    defineField({
      name: "preferredTimes",
      title: "Preferred times",
      type: "array",
      of: [{ type: "datetime" }],
      description: "Optional preferred session start times",
    }),
    defineField({
      name: "requester",
      title: "Requester",
      type: "object",
      fields: [
        { name: "clerkId", type: "string", title: "Clerk ID" },
        { name: "email", type: "string", title: "Email" },
        { name: "name", type: "string", title: "Name" },
      ],
    }),
    defineField({
      name: "attachments",
      title: "Attachments",
      type: "array",
      of: [defineArrayMember({ type: "image" })],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [
        { title: "Pending", value: "pending" },
        { title: "Approved", value: "approved" },
        { title: "Rejected", value: "rejected" },
      ] },
      initialValue: "pending",
    }),
    defineField({ name: "adminNote", title: "Admin note", type: "text" }),
    defineField({ name: "approvedBy", title: "Approved by", type: "reference", to: [{ type: "userProfile" }] }),
    defineField({ name: "approvedAt", title: "Approved at", type: "datetime" }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "status",
      media: "attachments.0",
      requester: "requester.name",
    },
    prepare({ title, subtitle, media, requester }) {
      return {
        title: title,
        subtitle: `${subtitle ? subtitle.toUpperCase() : ""} ${requester ? `• ${requester}` : ""}`,
        media,
      };
    },
  },
});