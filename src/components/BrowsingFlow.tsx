import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from './constants';

interface Props {
  onMessage: (msg: string, sender?:string) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
  setIsBrowsingFlowActive:any;
}

const BrowsingFlow: React.FC<Props> = ({ onMessage, setLoading, isLoading, setIsBrowsingFlowActive }) => {
  const [step, setStep] = useState<'initial' | 'askContact' | 'form' | 'done'>('initial');
  const [contactInput, setContactInput] = useState('');
  const [hasSentInitial, setHasSentInitial] = useState(false);

  const handleRadioSelect = (value: 'yes' | 'no') => {
    if (value === 'yes') {
        setLoading(true)
        setTimeout(()=>{
            setLoading(false)
            onMessage("Please provide your Email or Contact Number so that we can reach out.");
            setStep('form');
        },300)  
    } else {
      onMessage('No', 'user')
      setLoading(true)
      setTimeout(()=>{
          setLoading(false)
          onMessage("No worries! Let's continue.");
      },300)  
      setStep('done');
      setIsBrowsingFlowActive(false);
    }
  };

  const extractEmailOrPhone = (input: string): { email?: string; phone?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/;

    if (emailRegex.test(input)) {
      return { email: input };
    } else if (phoneRegex.test(input)) {
      return { phone: input };
    }

    return {};
  };

  const handleContactSubmit = async () => {
    const { email, phone } = extractEmailOrPhone(contactInput.trim());

    if (!email && !phone) {
      alert("Please enter a valid Email or Phone number.");
      return;
    }

    setLoading(true);
    try {
        onMessage(`${email || phone}`, 'user')
        setLoading(true)
      await axios.post(`${BaseUrl}/contact_form`, { email, phone });
      onMessage("Thanks! We'll reach out if needed.");
      setStep('done');
      
    } catch (err) {
      onMessage("Failed to submit contact info. Try again later.");
    } finally {
      setLoading(false);
      setStep('done');
      setIsBrowsingFlowActive(false);

    }
  };

  const handleContactCancel = () => {
    setStep('done');
    setIsBrowsingFlowActive(false);
  }

  useEffect(() => {
    if (step === 'initial' && !hasSentInitial) {
        setLoading(true)
        setTimeout(()=>{
            setLoading(false)
            onMessage("No problem! Feel free to explore our website. If you need any assistance, I'm always here to help.");
        },400)
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
            <label className="form-check-label text-white" htmlFor="yesContact">Yes, share my contact</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="noContact"
              name="contactShare"
              onChange={() => handleRadioSelect('no')}
            />
            <label className="form-check-label text-white" htmlFor="noContact">No, thank you</label>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="row p-sm-0 p-2 pt-0">
          <div className="col-12">
            {/* <div className="mb-2">
              Please provide your Email or Contact Number so that we can reach out.
            </div> */}
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Email or Phone"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
            />
            <button className="submit-button btn btn-primary" onClick={handleContactSubmit} disabled={isLoading}>
              Submit
            </button>
            <button className="btn btn-secondary submit-button mx-2" onClick={handleContactCancel} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BrowsingFlow;
