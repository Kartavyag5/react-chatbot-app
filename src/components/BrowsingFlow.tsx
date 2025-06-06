import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from './constants';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface Props {
  onMessage: (msg: string, sender?: string) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
  setIsBrowsingFlowActive: any;
}

const ContactSchema = Yup.object().shape({
  contact: Yup.string()
    .required('Contact is required')
    .test('is-valid', 'Enter a valid Email or Phone number', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      return emailRegex.test(value || '') || phoneRegex.test(value || '');
    }),
});

const BrowsingFlow: React.FC<Props> = ({ onMessage, setLoading, isLoading, setIsBrowsingFlowActive }) => {
  const [step, setStep] = useState<'initial' | 'askContact' | 'form' | 'done'>('initial');
  const [hasSentInitial, setHasSentInitial] = useState(false);

  const handleRadioSelect = (value: 'yes' | 'no') => {
    if (value === 'yes') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onMessage("Please provide your Email or Contact Number so that we can reach out.");
        setStep('form');
      }, 300);
    } else {
      onMessage('No', 'user');
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onMessage("No worries! Let's continue.");
        setStep('done');
        setIsBrowsingFlowActive(false);
      }, 300);
    }
  };

  const extractEmailOrPhone = (input: string): { email?: string; phone?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (emailRegex.test(input)) return { email: input };
    if (phoneRegex.test(input)) return { phone: input };
    return {};
  };

  const handleContactCancel = () => {
    setStep('done');
    setIsBrowsingFlowActive(false);
  };

  useEffect(() => {
    if (step === 'initial' && !hasSentInitial) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onMessage("No problem! Feel free to explore our website. If you need any assistance, I'm always here to help.");
      }, 400);
      setTimeout(() => {
        onMessage("Would you like to share your contact details for future assistance?");
        setStep('askContact');
      }, 2700);
      setHasSentInitial(true);
    }
  }, [step, hasSentInitial]);

  return (
    <>
      {step === 'askContact' && (
        <div className="row p-sm-0 p-2 pt-0">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="yesContact"
              name="contactShare"
              onChange={() => handleRadioSelect('yes')}
            />
            <label className="form-check-label text-white" htmlFor="yesContact">
              Yes, share my contact
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="noContact"
              name="contactShare"
              onChange={() => handleRadioSelect('no')}
            />
            <label className="form-check-label text-white" htmlFor="noContact">
              No, thank you
            </label>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="row p-sm-0 p-2 pt-0">
          <div className="col-12">
            <Formik
              initialValues={{ contact: '' }}
              validationSchema={ContactSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const { email, phone } = extractEmailOrPhone(values.contact.trim());

                onMessage(values.contact.trim(), 'user');
                setLoading(true);
                try {
                  await axios.post(`${BaseUrl}/contact_form`, { email, phone });
                  onMessage("Thanks! We'll reach out if needed.");
                  setStep('done');
                } catch (err) {
                  onMessage("Failed to submit contact info. Try again later.");
                  setStep('done');
                } finally {
                  setLoading(false);
                  setIsBrowsingFlowActive(false);
                  resetForm();
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field
                    type="text"
                    name="contact"
                    className="form-control mb-2"
                    placeholder="Email or Phone"
                  />
                  <ErrorMessage
                    name="contact"
                    component="div"
                    className="invalid-feedback d-block mb-2"
                  />

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary submit-button" disabled={isSubmitting || isLoading}>
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary submit-button"
                      onClick={handleContactCancel}
                      disabled={isSubmitting || isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default BrowsingFlow;
