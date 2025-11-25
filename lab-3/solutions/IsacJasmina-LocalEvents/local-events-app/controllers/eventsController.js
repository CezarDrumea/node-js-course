import prisma from "../lib/prisma.js";

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { category: true, user: true }
    });

    res.render("index", { title: "Evenimente Locale", events });
  } catch (error) {
    res.status(500).send("Eroare la încărcarea evenimentelor.");
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { 
        category: true, 
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).send("Evenimentul nu a fost găsit.");
    }

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

export const showAddForm = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    
    res.render("eventForm", { 
      title: "Adaugă Eveniment", 
      event: {}, 
      errors: {},
      isEdit: false,
      categories
    });
  } catch (error) {
    res.status(500).send("Eroare la încărcarea formularului.");
  }
};

export const showEditForm = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
    });

    if (!event) {
      return res.status(404).send("Evenimentul nu a fost găsit.");
    }
    const categories = await prisma.category.findMany();

    const formattedDate = event.date ? event.date.toISOString().split('T')[0] : '';

    res.render("eventForm", {
      title: "Editează Eveniment",
      event: {
        ...event,
        date: formattedDate
      },
      errors: {},
      isEdit: true,
      categories
    });

  } catch (error) {
    res.status(404).send("Evenimentul nu a fost găsit.");
  }
};

export const addEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, categoryId, organizer, price } = req.body;
    const errors = {};

    if (!title?.trim()) errors.title = "Titlul este obligatoriu.";
    if (!description?.trim()) errors.description = "Descrierea este obligatorie.";
    if (!date) errors.date = "Data este obligatorie.";
    if (!time) errors.time = "Ora este obligatorie.";
    if (!location?.trim()) errors.location = "Locația este obligatorie.";
    if (!categoryId?.trim()) errors.category = "Categoria este obligatorie.";
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
      date: new Date(date),
      time,
      location,
      organizer,
      price,
      image: req.file ? req.file.filename : null,
      category: { connect: { id: categoryId } },
      user: req.user ? { connect: { id: req.user.id } } : undefined,
    };

    await prisma.event.create({ data: eventData });

    res.redirect("/events");
  } catch (error) {
    console.error("Eroare la crearea evenimentului:", error);
    res.status(500).send("Eroare la crearea evenimentului.");
  }
};

export const editEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, categoryId, organizer, price } = req.body;
    const errors = {};

    // Validări
    if (!title?.trim()) errors.title = "Titlul este obligatoriu.";
    if (!description?.trim()) errors.description = "Descrierea este obligatorie.";
    if (!date) errors.date = "Data este obligatorie.";
    if (!time) errors.time = "Ora este obligatorie.";
    if (!location?.trim()) errors.location = "Locația este obligatorie.";
    if (!categoryId?.trim()) errors.category = "Categoria este obligatorie.";
    if (!organizer?.trim()) errors.organizer = "Organizatorul este obligatoriu.";
    if (!price?.trim()) errors.price = "Prețul este obligatoriu.";

    // Validare imagine (multer)
    let image;
    if (req.file) {
      image = req.file.filename;
    } else {
      image = req.body.existingImage || null;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render("eventForm", {
        event: req.body,
        errors,
        isEdit: true,
      });
    }

    const updatedData = {
      title,
      description,
      date: new Date(date),
      time,
      location,
      organizer,
      price,
      image,
      category: { connect: { id: categoryId } },
      user: req.user ? { connect: { id: req.user.id } } : undefined,
    };

    await prisma.event.update({
      where: { id: req.params.id },
      data: updatedData,
    });

    res.redirect("/events/" + req.params.id);
  } catch (error) {
    console.error("Eroare la actualizare:", error);
    res.status(500).send("Eroare la actualizarea evenimentului.");
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id },
    });
    res.redirect("/events");
  } catch (error) {
    console.error("Eroare la ștergerea evenimentului:", error);
    res.status(500).send("Eroare la ștergerea evenimentului.");
  }
};

export const getEventsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId; 
    const events = await prisma.event.findMany({
      where: { categoryId: parseInt(categoryId) },
      include: { category: true, user: true }
    });
    res.render("events", { events });
  } catch (error) {
    console.error("Eroare la obtinerea evenimentelor:", error);
    res.status(500).send("Eroare la obtinerea evenimentelor.");
  }
};

export const getEventsByUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send("Trebuie să fii autentificat pentru a vedea evenimentele tale.");
    }

    const events = await prisma.event.findMany({
      where: { userId: req.user.id },
      include: { category: true, user: true }
    });

    res.render("events", { events });
  } catch (error) {
    console.error("Eroare la obtinerea evenimentelor:", error);
    res.status(500).send("Eroare la obtinerea evenimentelor.");
  }
};