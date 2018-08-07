import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import formFields from "./formFields";
import { submitSurvey } from "../../actions/index.js";

const SurveyFormReview = ({ onCancel, formValues, submitSurvey, history }) => {
  const reviewFields = _.map(formFields, ({ name, label }) => {
    return (
      <div key={name}>
        <label>{label}</label>
        <div>{formValues[name]}</div>
      </div>
    );
  });
  return (
    <div>
      <h5>Please confirm your entries</h5>
      {reviewFields}
      <button className="yellow darken-3 btn-flat" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="green btn-flat right"
        onClick={() => {
          submitSurvey(formValues, history);
        }}
      >
        Send Survey
        <i className="material-icons right">email</i>
      </button>
    </div>
  );
};
function mapStateToProps({ form: { surveyForm } }) {
  return {
    formValues: surveyForm.values
  };
}
export default connect(mapStateToProps, { submitSurvey })(
  withRouter(SurveyFormReview)
);
