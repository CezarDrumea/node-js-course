import * as EventModel from "../models/eventModel.js";

export const getEvents = async (req, res) => {
  try {
    const events = await EventModel.getAllEvents();
    res.render("index", { title: "Evenimente Locale", events });
  } catch (error) {
    res.status(500).send("Eroare la încărcarea evenimentelor.");
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await EventModel.getEventById(req.params.id);
    res.render("event", { 
      title: event.title, 
      event,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Evenimentul nu a fost găsit.");
  }
};

export const showAddForm = (req, res) => {
  res.render("eventForm", { 
    title: "Adaugă Eveniment", 
    event: {}, 
    errors: {},
    isEdit: false 
  });
};

export const showEditForm = async (req, res) => {
  try {
    const event = await EventModel.getEventById(req.params.id);
    res.render("eventForm", { 
      title: "Editează Eveniment", 
      event, 
      errors: {},
      isEdit: true 
    });
  } catch (error) {
    res.status(404).send("Evenimentul nu a fost găsit.");
  }
};

export const addEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category, organizer, price } = req.body;
    const errors = {};

    if (!title?.trim()) errors.title = "Titlul este obligatoriu.";
    if (!description?.trim()) errors.description = "Descrierea este obligatorie.";
    if (!date) errors.date = "Data este obligatorie.";
    if (!time) errors.time = "Ora este obligatorie.";
    if (!location?.trim()) errors.location = "Locația este obligatorie.";
    if (!category?.trim()) errors.category = "Categoria este obligatorie.";
    if (!organizer?.trim()) errors.organizer = "Organizatorul este obligatoriu.";
    if (!price?.trim()) errors.price = "Prețul este obligatoriu.";

    // Validare imagine (multer)
    if (!req.file) {
      errors.image = "Este necesară o imagine.";
    } else {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(req.file.mimetype)) {
        errors.image = "Imaginea trebuie să fie JPG, PNG sau WEBP.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render("eventForm", {
        event: req.body,
        errors,
      });
    }

    const eventData = {
      title,
      description,
      date,
      time,
      location,
      category,
      organizer,
      price,
      image: req.file ? `${req.file.filename}` : null,
    };

    await EventModel.createEvent(eventData);
    res.redirect("/events");
  } catch (error) {
    console.error(error);
    res.status(500).send("Eroare la crearea evenimentului.");
  }
};


export const editEvent = async (req, res) => {
  try {
    const updatedData = req.body;

    if (req.file) {
      updatedData.image = req.file.filename;
    } else {
      updatedData.image = req.body.existingImage;
    }

    await EventModel.updateEvent(req.params.id, updatedData);
    res.redirect("/events/" + req.params.id);
  } catch (error) {
    console.error("Eroare la actualizare:", error);
    res.status(500).send("Eroare la actualizarea evenimentului.");
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await EventModel.deleteEvent(req.params.id);
    res.redirect("/events");
  } catch (error) {
    console.error("Eroare la ștergerea evenimentului:", error);
    res.status(500).send("Eroare la ștergerea evenimentului.");
  }
};
