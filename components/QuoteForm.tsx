"use client";

import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";

// ✅ import your local json
import statesCitiesRaw from "@/app/(main)/data/states-cities.json";

type StatesCitiesShapeA = { state: string; cities: string[] };
type StatesCitiesShapeB = { name: string; cities: string[] };
type StatesCitiesShapeC = Record<string, string[]>; // { "Texas": ["Houston", ...] }

const MovingCalculator: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referer, setReferer] = useState("Direct");
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
  const [submitting, setSubmitting] = useState(false);

  const movingOptions = [
    "Studio residence",
    "1 bedroom residence",
    "2 bedroom residence",
    "3 bedroom residence",
    "4+ bedroom residence",
    "Office move",
  ];

  // ---------------- STATES/CITIES from JSON ----------------
  const statesCities = useMemo(() => {
    const raw: any = statesCitiesRaw;

    // ✅ If it's array of {state,cities} or {name,cities}
    if (Array.isArray(raw)) {
      return raw.map((x: any) => ({
        state: x.state || x.name,
        cities: x.cities || x.city || [],
      })) as { state: string; cities: string[] }[];
    }

    // ✅ If it's object map { "Texas": ["Houston"] }
    if (raw && typeof raw === "object") {
      return Object.entries(raw).map(([state, cities]) => ({
        state,
        cities: Array.isArray(cities) ? cities : [],
      }));
    }

    return [];
  }, []);

  const usStates = useMemo(
    () => statesCities.map((s) => s.state).filter(Boolean),
    [statesCities]
  );

  const fromCities = useMemo(() => {
    const found = statesCities.find(
      (s) => s.state.toLowerCase() === fromState.toLowerCase()
    );
    return found?.cities || [];
  }, [statesCities, fromState]);

  const toCities = useMemo(() => {
    const found = statesCities.find(
      (s) => s.state.toLowerCase() === toState.toLowerCase()
    );
    return found?.cities || [];
  }, [statesCities, toState]);

  // ---------------- ZIP VALIDATION ----------------
  const isValidUSZip = (zip: string) => {
    // 5 digit OR 5+4
    return /^\d{5}(-\d{4})?$/.test(zip.trim());
  };

  const handleZipChange = (
    val: string,
    type: "fromZip" | "toZip"
  ) => {
    const cleaned = val.replace(/[^0-9-]/g, ""); // only digits & dash
    if (type === "fromZip") setFromZip(cleaned);
    if (type === "toZip") setToZip(cleaned);

    // live validate
    setErrors((prev) => {
      const next = { ...prev };
      if (cleaned && !isValidUSZip(cleaned)) {
        next[type] = "Invalid US ZIP code.";
      } else {
        delete next[type];
      }
      return next;
    });
  };

  // ---------------- BASIC EFFECTS ----------------
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setFromIp(data.ip))
      .catch(() => {});
    if (document.referrer) setReferer(document.referrer);
  }, []);

  useEffect(() => {
    if (fromState && toState) {
      setLeadType(fromState === toState ? "Local" : "International");
    }
  }, [fromState, toState]);

  const handleCalculate = async () => {
    if (submitting) return;

    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format.";
    if (!phone) newErrors.phone = "Phone is required.";
    if (!leadType) newErrors.leadType = "Lead type is required.";
    if (!acceptedTerms) newErrors.terms = "You must accept the Terms.";

    // ✅ ZIP required + valid
    if (!fromZip) newErrors.fromZip = "From ZIP is required.";
    else if (!isValidUSZip(fromZip))
      newErrors.fromZip = "Invalid US ZIP code.";

    if (!toZip) newErrors.toZip = "To ZIP is required.";
    else if (!isValidUSZip(toZip))
      newErrors.toZip = "Invalid US ZIP code.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors and try again.");
      return;
    }

    setSubmitting(true);

    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    const jsonPayload = {
      key: "c5QlLF3Ql90DGQr222tIqHd441",
      lead_type: leadType,
      lead_source: referer ? "Website: " + referer : "Website: Direct",
      referer: referer || "Direct",
      from_ip: fromIp,
      first_name: firstName,
      last_name: lastName,
      email: email.trim().toLowerCase(),
      phone: phone.replace(/[^0-9]/g, ""),

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

      car_make: "",
      car_model: "",
      car_make_year: "",
    };

    try {
      const response = await fetch("/api/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonPayload),
      });

      if (response.status === 409) {
        toast.error("Email or phone no is duplicate.");
        return;
      }

      if (!response.ok) {
        toast.error("Failed to save form data.");
        return;
      }

      const data = await response.json();

      if (data?.message === "Form submitted successfully") {
        await sendToExternalAPI(jsonPayload);
        toast.success("Form submitted and saved successfully!");
        resetForm();
      } else {
        toast.error("An error occurred while submitting the form.");
      }
    } catch {
      toast.error(
        "There was an issue submitting the form. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sendToExternalAPI = async (jsonPayload: any) => {
    const sendingPoint = "/api/moving/receive-leads/receive.php/";
    const headers = new Headers({
      Authorization: "Token token=buzzmoving2017",
      "Content-Type": "application/json",
    });

    try {
      const response = await fetch(sendingPoint, {
        credentials: "include",
        method: "POST",
        headers,
        body: JSON.stringify(jsonPayload),
      });

      const contentType = response.headers.get("content-type");
      let result: any;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = JSON.parse(await response.text());
      }

      await fetch("/api/save-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
    } catch {
      // silent fail
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setFromZip("");
    setFromCity("");
    setFromState("");
    setToZip("");
    setToCity("");
    setToState("");
    setMovingType("");
    setMovingDate(null);
    setAcceptedTerms(false);
    setErrors({});
  };

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-xl mx-auto bg-white text-black p-4 border border-gray-300 rounded-xl shadow-md text-sm">
      <h2 className="text-xl font-bold text-center mb-4">
        Moving Cost Calculator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Full Name"
          className={`p-2 border rounded ${errors.name ? "border-red-500" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className={`p-2 border rounded ${
            errors.email ? "border-red-500" : ""
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone"
          className={`p-2 border rounded ${
            errors.phone ? "border-red-500" : ""
          }`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* ✅ From ZIP (typeable + validate) */}
        <input
          type="text"
          placeholder="From ZIP"
          className={`p-2 border rounded ${
            errors.fromZip ? "border-red-500" : ""
          }`}
          value={fromZip}
          onChange={(e) => handleZipChange(e.target.value, "fromZip")}
        />

        {/* ✅ From State */}
        <select
          className="p-2 border rounded"
          value={fromState}
          onChange={(e) => {
            setFromState(e.target.value);
            setFromCity(""); // reset city
          }}
        >
          <option value="">From State</option>
          {usStates.map((state, i) => (
            <option key={i} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* ✅ From City (depends on state) */}
        <select
          className="p-2 border rounded"
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          disabled={!fromState}
        >
          <option value="">From City</option>
          {fromCities.map((city, i) => (
            <option key={i} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* ✅ To ZIP (typeable + validate) */}
        <input
          type="text"
          placeholder="To ZIP"
          className={`p-2 border rounded ${
            errors.toZip ? "border-red-500" : ""
          }`}
          value={toZip}
          onChange={(e) => handleZipChange(e.target.value, "toZip")}
        />

        {/* ✅ To State */}
        <select
          className="p-2 border rounded"
          value={toState}
          onChange={(e) => {
            setToState(e.target.value);
            setToCity("");
          }}
        >
          <option value="">To State</option>
          {usStates.map((state, i) => (
            <option key={i} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* ✅ To City */}
        <select
          className="p-2 border rounded"
          value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          disabled={!toState}
        >
          <option value="">To City</option>
          {toCities.map((city, i) => (
            <option key={i} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={movingType}
          onChange={(e) => setMovingType(e.target.value)}
        >
          <option value="">Select Move Size</option>
          {movingOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
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
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <label className="text-sm">
            I accept the{" "}
            <a href="/terms" className="underline text-blue-600">
              Terms and Conditions
            </a>
          </label>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleCalculate}
          disabled={submitting}
          className="px-4 py-2 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Calculate"}
        </button>
      </div>
    </div>
  );
};

export default MovingCalculator;
