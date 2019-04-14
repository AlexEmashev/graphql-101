const Event = require('../../models/event');
const { transformEvent } = require('./merge');
const User = require('../../models/user');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        // event.id is virtual getter that converts to ObjectId
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });
    let createdEvent;
    try {
      // Return event, so Express know, that it should wait until it is resolved
      // Instead of returning immediatly.
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById(req.userId);
      if (!creator) {
        throw new Error('User does not exist.');
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  }
};
