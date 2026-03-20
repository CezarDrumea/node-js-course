import axios from "axios";

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || "http://localhost:3001";

export const getAllEvents = async () => {
  const response = await axios.get(`${JSON_SERVER_URL}/events`);
  return response.data;
};

export const getEventById = async (id) => {
  const response = await axios.get(`${JSON_SERVER_URL}/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await axios.post(`${JSON_SERVER_URL}/events/`, eventData);
  return response.data;
};  

export const updateEvent = async (id, eventData) => {
  const response = await axios.put(`${JSON_SERVER_URL}/events/${id}`, eventData);
  return response.data;
}

export const deleteEvent = async (id) => {
  const response = await axios.delete(`${JSON_SERVER_URL}/events/${id}`);
  return response.data;
}

