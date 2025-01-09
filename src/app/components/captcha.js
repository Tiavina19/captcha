"use client";
import { useEffect, useState } from "react";

const CaptchaApp = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [randomNumbers, setRandomNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaResolved, setCaptchaResolved] = useState(false);

  useEffect(() => {
    const loadCaptchaScript = () => {
      const script = document.createElement("script");
      script.src =
      "https://09bd26e5e726.eu-west-3.captcha-sdk.awswaf.com/09bd26e5e726/jsapi.js";
      script.type = "text/javascript";
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    };

    if (typeof window !== "undefined" && !scriptLoaded) {
      loadCaptchaScript();
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (
      scriptLoaded &&
      typeof window !== "undefined" &&
      window.ExampleCaptcha
    ) {
      window.showCaptcha = function () {
        const container = document.querySelector("#captcha-container");

        window.ExampleCaptcha.render(container, {
          apiKey: process.env.NEXT_PUBLIC_CAPTCHA_API_KEY,
          onSuccess: (token) => {
            setCaptchaResolved(true);
          },
          onError: (error) => {
            console.error("Captcha Error:", error);
          },
        });
      };
    }
  }, [scriptLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const N = parseInt(inputValue, 10);
    if (isNaN(N) || N < 1 || N > 1000) {
      alert("Please enter a valid number between 1 and 1000.");
      return;
    }
    setRandomNumbers([]);
    setIsLoading(true);

    for (let i = 1; i <= N; i++) {
      if (!captchaResolved) {
        window.showCaptcha && window.showCaptcha();
        break;
      }
      try {
        const randomNumber = Math.floor(Math.random() * 1000);
        setRandomNumbers((prev) => [...prev, `${i}. Random Number: ${randomNumber}`]);
      } catch (error) {
        console.error(`Error on request ${i}:`, error);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1>CAPTCHA SYSTEM WITH RANDOM NUMBERS</h1>
      <div>
        {randomNumbers.length === 0 && !isLoading && (
          <form onSubmit={handleSubmit}>
            <label>
              Enter a number (1-1000):
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </label>
            <button type="submit">Submit</button>
          </form>
        )}
        {isLoading && <p>Loading...</p>}
        {randomNumbers.length > 0 && (
          <div>
            {randomNumbers.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
        <div id="captcha-container" />
      </div>
    </div>
  );
};

export default CaptchaApp;
