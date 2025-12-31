export const PENDING_CLASS_REQUESTS_QUERY = `*[_type == "classRequest" && status == "pending"] | order(_createdAt desc) {
  _id,
  title,
  description,
  instructor,
  duration,
  categoryName,
  suggestedVenue,
  preferredTimes,
  requester,
  attachments,
  _createdAt
}`;

export const CLASS_REQUEST_BY_ID_QUERY = `*[_type == "classRequest" && _id == $id][0] {
  _id,
  title,
  description,
  instructor,
  duration,
  categoryName,
  suggestedVenue,
  preferredTimes,
  requester,
  attachments,
  status,
  adminNote,
  approvedAt,
  approvedBy
}`;
