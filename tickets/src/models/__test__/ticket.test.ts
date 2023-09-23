import { Ticket } from "../ticket";

it('Implements optimistic concurrency control', async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 50,
    userId: '123'
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const firstInstance   = await Ticket.findById(ticket.id);
  const secondInstance  = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 100 });
  secondInstance!.set({ price: 120 });

  // Save the first fetched ticket
  await firstInstance!.save();

  // Save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not react this point');
});

it('Increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 50,
    userId: '123'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});