const express = require("express");
const _ = require("lodash");
const router = express.Router();
const Path = require("path-parser");
const { URL } = require("url");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const surveyTemplate = require("../services/EmailTemplates/surveyTemplate");
const Mailer = require("../services/Mailer");

const Survey = mongoose.model("surveys");

router.get("/api/surveys/:surveyId/:choice", (req, res) => {
  res.send("Thankyou for Voting");
});

router.get("/api/surveys", requireLogin, async (req, res) => {
  const surveys = await Survey.find({ _user: req.user.id }).select({
    recipients: false
  });
  res.send(surveys);
});

router.post("/api/surveys/webhooks", (req, res) => {
  const p = new Path("/api/surveys/:surveyId/:choice");
  _.chain(req.body)
    .map(({ url, email }) => {
      const match = p.test(new URL(url).pathname);
      if (match) {
        return { ...match, email };
      }
    })
    .compact()
    .uniqBy("email", "surveyId")
    .each(({ email, surveyId, choice }) => {
      Survey.updateOne(
        {
          _id: surveyId,
          recipients: {
            $elemMatch: { email, responded: false }
          }
        },
        {
          $inc: {
            [choice]: 1
          },
          $set: {
            "recipients.$.responded": true
          },
          lastResponded: new Date()
        }
      ).exec();
    })
    .value();
});
router.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
  const { title, subject, body, recipients } = req.body;
  const survey = new Survey({
    title,
    subject,
    body,
    recipients: recipients.split(",").map(email => ({ email: email.trim() })),
    _user: req.user.id,
    dateSent: Date.now()
  });
  const mailer = new Mailer(survey, surveyTemplate(survey));
  try {
    await mailer.send();
    await survey.save();
    req.user.credits -= 1;
    const user = await req.user.save();
    res.send(user);
  } catch (err) {
    res.status(422).send(err);
  }
});

module.exports = router;
