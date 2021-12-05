module.exports =
  (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({ error: 'Please sign-in.'});
    } else if (err) {
      res.status(400).json({"error" : err.name + ": " + err.message})
      console.log(err);
    }
};