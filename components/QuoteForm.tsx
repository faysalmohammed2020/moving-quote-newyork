// same imports...
"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MovingCalculator: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referer, setReferer] = useState("");
  const [leadType, setLeadType] = useState("");
  const [fromZip, setFromZip] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromState, setFromState] = useState("");
  const [toZip, setToZip] = useState("");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState("");
  const [movingType, setMovingType] = useState("");
  const [movingDate, setMovingDate] = useState<Date | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fromIp, setFromIp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const movingOptions = [
    "Studio residence",
    "1 bedroom residence",
    "2 bedroom residence",
    "3 bedroom residence",
    "4+ bedroom residence",
    "Office move",
  ];

  const leadTypes = ["Residential", "Commercial", "International", "Other"];
  const usStates = ["California", "Texas", "Florida", "New York", "Illinois"];
  const zipCodes = ["10001", "90001", "60601", "75201", "30301", "94101"];
  const cities = ["Los Angeles", "New York", "Chicago", "Dallas", "Atlanta", "San Francisco"];

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setFromIp(data.ip))
      .catch((err) => console.error("IP fetch error:", err));
  }, []);

  const handleCalculate = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
    if (!phone) newErrors.phone = "Phone is required.";
    if (!referer) newErrors.referer = "Referer is required.";
    if (!leadType) newErrors.leadType = "Lead type is required.";
    if (!acceptedTerms) newErrors.terms = "You must accept the Terms.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ");

      const jsonPayload = {
        key: "c5QlLF3Ql90DGQr222tIqHd441",
        lead_type: leadType,
        lead_source: "Facebook: " + referer,
        referer: "Facebook: " + referer,
        from_ip: fromIp,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone.replace(/[^0-9]/g, ""),
        phone_ext: "",
        from_state: capitalizeWords(fromState),
        from_state_code: fromState.slice(0, 2).toUpperCase(),
        from_city: capitalizeWords(fromCity),
        from_zip: fromZip,
        to_state: capitalizeWords(toState),
        to_state_code: toState.slice(0, 2).toUpperCase(),
        to_city: capitalizeWords(toCity),
        to_zip: toZip,
        move_date: movingDate?.toISOString().split("T")[0] || "",
        move_size: movingType,
        self_packaging: 0,
        has_car: 0,
        car_make: "",
        car_model: "",
        car_make_year: "",
      };

      fetch("/api/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonPayload),
      })
        .then((res) => res.json())
        .then((data) => {
          alert("Form submitted and saved!");
          console.log("Response:", data);
        })
        .catch((err) => {
          alert("Submission failed");
          console.error("Error:", err);
        });
      
    }
  };

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="max-w-xl mx-auto bg-white text-black p-4 border border-gray-300 rounded-xl shadow-md text-sm">
      <h2 className="text-xl font-bold text-center mb-4">Moving Cost Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" placeholder="Full Name" className="p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" className="p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="text" placeholder="Phone" className="p-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="text" placeholder="Referer (Page Name)" className="p-2 border rounded" value={referer} onChange={(e) => setReferer(e.target.value)} />

        <select className="p-2 border rounded" value={leadType} onChange={(e) => setLeadType(e.target.value)}>
          <option value="">Select Lead Type</option>
          {leadTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
        </select>

        <select className="p-2 border rounded" value={fromZip} onChange={(e) => setFromZip(e.target.value)}>
          <option value="">From Zip</option>
          {zipCodes.map((zip) => <option key={zip} value={zip}>{zip}</option>)}
        </select>

        <select className="p-2 border rounded" value={fromCity} onChange={(e) => setFromCity(e.target.value)}>
          <option value="">From City</option>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>

        <select className="p-2 border rounded" value={fromState} onChange={(e) => setFromState(e.target.value)}>
          <option value="">From State</option>
          {usStates.map((state, i) => <option key={i} value={state}>{state}</option>)}
        </select>

        <select className="p-2 border rounded" value={toZip} onChange={(e) => setToZip(e.target.value)}>
          <option value="">To Zip</option>
          {zipCodes.map((zip) => <option key={zip} value={zip}>{zip}</option>)}
        </select>

        <select className="p-2 border rounded" value={toCity} onChange={(e) => setToCity(e.target.value)}>
          <option value="">To City</option>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>

        <select className="p-2 border rounded" value={toState} onChange={(e) => setToState(e.target.value)}>
          <option value="">To State</option>
          {usStates.map((state, i) => <option key={i} value={state}>{state}</option>)}
        </select>

        <select className="p-2 border rounded" value={movingType} onChange={(e) => setMovingType(e.target.value)}>
          <option value="">Select Move Size</option>
          {movingOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>

        <div className="col-span-1 md:col-span-2">
          <DatePicker
            selected={movingDate}
            onChange={(date) => setMovingDate(date)}
            placeholderText="Moving Date"
            minDate={new Date()}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
          <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
          <label className="text-sm">
            I accept the{" "}
            <a href="/terms" className="underline text-blue-600">Terms and Conditions</a>
          </label>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button onClick={handleCalculate} className="px-4 py-2 bg-amber-600 text-white font-medium rounded hover:bg-amber-700">
          Calculate
        </button>
      </div>
    </div>
  );
};

export default MovingCalculator;
