"use client";
import { useEffect, useState } from "react";

const CaptchaApp = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [resultSequence, setResultSequence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Load the AWS Captcha script
  useEffect(() => {
    const appendCaptchaScript = () => {
      const scriptElement = document.createElement("script");
      scriptElement.src = "https://09bd26e5e726.eu-west-3.captcha-sdk.awswaf.com/09bd26e5e726/jsapi.js";
      scriptElement.defer = true;
      scriptElement.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(scriptElement);
    };

    if (typeof window !== "undefined" && !isScriptLoaded) {
      appendCaptchaScript();
    }
  }, [isScriptLoaded]);

  // Initialize the captcha when script is loaded
  useEffect(() => {
    if (isScriptLoaded && window.AwsWafCaptcha) {
      window.displayCaptcha = () => {
        const captchaContainer = document.querySelector("#captcha-container");
        window.AwsWafCaptcha.renderCaptcha(captchaContainer, {
          apiKey: process.env.NEXT_PUBLIC_WAF_API_KEY,
          onSuccess: () => setCaptchaVerified(true),
          onError: (err) => console.error("Captcha Error:", err),
        });
      };
    }
  }, [isScriptLoaded]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const inputNumber = parseInt(userInput, 10);

    if (isNaN(inputNumber) || inputNumber < 1 || inputNumber > 1000) {
      alert("Enter a number between 1 and 1000.");
      return;
    }

    setResultSequence([]);
    setLoading(true);

    for (let i = 1; i <= inputNumber; i++) {
      if (!captchaVerified) {
        window.displayCaptcha && window.displayCaptcha();
        break;
      }

      try {
        await fetch("https://api.prod.jcloudify.com/whoami");
        setResultSequence((prev) => [...prev, `${i}: Access Denied`]);
      } catch (err) {
        console.error(`Error on request ${i}:`, err);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Captcha Sequence Generator</h1>

      {resultSequence.length === 0 && !loading && (
        <form onSubmit={handleFormSubmit}>
          <label>
            Number (1-1000):
            <input
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </label>
          <button type="submit">Generate</button>
        </form>
      )}

      {resultSequence.length > 0 && (
        <div>
          {resultSequence.map((item, idx) => (
            <p key={idx}>{item}</p>
          ))}
        </div>
      )}

      {loading && <p>Generating sequence...</p>}

      <div id="captcha-container"></div>
    </div>
  );
};

export default CaptchaApp;
