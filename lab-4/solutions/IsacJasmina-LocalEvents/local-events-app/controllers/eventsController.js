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
    const eventData = {
      title,
      description,
      date: new Date(date),
      time,
      location,
      organizer,
      price,
      image: req.file ? req.file.filename : 'default-event.jpeg',
      category: { connect: { id: categoryId } },
      user: req.user ? { connect: { id: req.user.id } } : undefined,
    };
    await prisma.event.create({ data: eventData });
    res.redirect("/events");
  } catch (error) {
    console.error("Eroare la crearea evenimentului:", error);
    
    const categories = await prisma.category.findMany();
    return res.status(500).render("eventForm", {
      event: req.body,
      errors: { form: "Eroare la crearea evenimentului. Încearcă din nou." },
      categories,
      isEdit: false,
      title: "Adaugă Eveniment"
    });
  }
};

export const editEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, categoryId, organizer, price } = req.body;

    const updatedData = {
      title,
      description,
      date: new Date(date),
      time,
      location,
      organizer,
      price,
      category: { connect: { id: categoryId } },
      user: req.user ? { connect: { id: req.user.id } } : undefined,
    };

    if (req.file) {
      updatedData.image = req.file.filename;
    } else if (req.body.existingImage) {
      updatedData.image = req.body.existingImage;
    }

    await prisma.event.update({
      where: { id: id },
      data: updatedData,
    });

    res.redirect("/events/" + id);

  } catch (error) {
    console.error("Eroare la editarea evenimentului:", error);
    
    const categories = await prisma.category.findMany();
    return res.status(500).render("eventForm", {
      event: req.body,
      errors: { form: "Eroare la editarea evenimentului. Încearcă din nou." },
      categories,
      isEdit: true,
      title: "Editează Eveniment"
    });
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