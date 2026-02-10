import { defineQuery } from "next-sanity";

export const ATTENDEES_FOR_SESSION_QUERY = defineQuery(`*[
  _type == "booking"
  && classSession._ref == $sessionId
  && status in ["confirmed", "attended"]
] | order(createdAt asc) {
  _id,
  status,
  createdAt,
  user->{
    _id,
    firstName,
    lastName,
    email,
    imageUrl
  }
}`);
