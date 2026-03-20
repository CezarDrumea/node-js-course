import prisma from "../lib/prisma.js";

export const checkEventOwnership = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).send("Evenimentul nu a fost găsit.");
    }

    if (event.userId !== req.user.id) {
      return res.status(403).send("Nu ai permisiunea să modifici acest eveniment.");
    }

    req.event = event;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Eroare la verificarea permisiunilor.");
  }
};