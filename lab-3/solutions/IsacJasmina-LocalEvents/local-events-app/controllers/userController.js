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
      error: null,
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
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Helper function pentru a evita repetarea codului
    const renderWithError = async (errorMessage) => {
      return res.render("profile", {
        title: "Profilul meu",
        user: req.user,
        events: await prisma.event.findMany({
          where: { userId: req.user.id },
          include: { category: true },
          orderBy: { createdAt: 'desc' }
        }),
        error: errorMessage,
        success: null,
        formData: req.body // Păstrează datele introduse anterior
      });
    };
    
    // Validări
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return renderWithError("Toate câmpurile sunt obligatorii.");
    }
    
    if (newPassword !== confirmNewPassword) {
      return renderWithError("Parolele noi nu se potrivesc.");
    }
    
    if (newPassword.length < 6) {
      return renderWithError("Parola nouă trebuie să aibă minim 6 caractere.");
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return renderWithError("Parola curentă este incorectă.");
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
      error: null,
      success: "Parola a fost schimbată cu succes!",
      formData: {}
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Eroare la schimbarea parolei.");
  }
};