import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUserProfile = async (req, res) => {
  try {
    const userEvents = await prisma.event.findMany({
      where: { userId: req.user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.render("profile", {
      title: "Profilul meu",
      user: req.user,
      events: userEvents,
      errors: null,
      success: null,
      formData: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Eroare la încărcarea profilului.");
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {

      const events = await prisma.event.findMany({
        where: { userId: req.user.id },
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      });

      return res.render("profile", {
        title: "Profilul meu",
        user,
        events,
        errors: { currentPassword: "Parola curentă este incorectă." },
        success: null,
        formData: req.body
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.render("profile", {
      title: "Profilul meu",
      user: req.user,
      events: await prisma.event.findMany({
        where: { userId: req.user.id },
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      }),
      errors: null,
      success: "Parola a fost schimbată cu succes!",
      formData: {}
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Eroare la schimbarea parolei.");
  }
};
