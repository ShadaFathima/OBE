import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [questionToCO, setQuestionToCO] = useState([]);
  const [coDefinitions, setCoDefinitions] = useState([]);
  const [response, setResponse] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const itemRefs = useRef([]);
  const responseContainerRef = useRef(null); // Ref for keyboard focus

  useEffect(() => {
    setQuestionToCO(Array.from({ length: 15 }, () => ({ question: "", co: "" })));
    setCoDefinitions(Array.from({ length: 5 }, () => ({ co: "", definition: "" })));
  }, []);

  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (response?.results?.length && responseContainerRef.current) {
      responseContainerRef.current.focus(); // Auto-focus for keyboard input
    }
  }, [response]);

  const handleAddMapping = () => {
    setQuestionToCO([...questionToCO, { question: "", co: "" }]);
  };

  const handleAddDefinition = () => {
    setCoDefinitions([...coDefinitions, { co: "", definition: "" }]);
  };

  const handleMappingChange = (index, field, value) => {
    const updated = [...questionToCO];
    updated[index][field] = value;
    setQuestionToCO(updated);
  };

  const handleDefinitionChange = (index, field, value) => {
    const updated = [...coDefinitions];
    updated[index][field] = value;
    setCoDefinitions(updated);
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    const questionToCOJson = {};
    questionToCO.forEach(({ question, co }) => {
      if (question && co) questionToCOJson[question] = co;
    });
    formData.append("co_mapping_json", JSON.stringify(questionToCOJson));

    const coDefinitionsJson = {};
    coDefinitions.forEach(({ co, definition }) => {
      if (co && definition) coDefinitionsJson[co] = definition;
    });
    formData.append("co_definitions_json", JSON.stringify(coDefinitionsJson));

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResponse(res.data);
      setSelectedIndex(0);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Error uploading file: " + (err.response?.data?.detail || err.message));
    }
    // print passed data to console for debugging
    console.log("File:", file);
    console.log("CO Mapping JSON:", questionToCO);
    console.log("CO Definitions JSON:", coDefinitions);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold mb-6">Upload Student Marks Excel</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-6 block"
      />

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Question to CO Mapping</h2>
        {questionToCO.map((item, index) => (
          <div key={index} className="flex gap-3 mb-2">
            <input
              placeholder={`Question ${index + 1}`}
              value={item.question}
              onChange={(e) => handleMappingChange(index, "question", e.target.value)}
              className="border rounded p-2 w-1/2"
            />
            <input
              placeholder="CO (e.g., CO1)"
              value={item.co}
              onChange={(e) => handleMappingChange(index, "co", e.target.value)}
              className="border rounded p-2 w-1/2"
            />
          </div>
        ))}
        <button onClick={handleAddMapping} className="bg-yellow-600 text-white px-4 py-2 rounded">
          + Add More
        </button>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">CO Definitions</h2>
        {coDefinitions.map((item, index) => (
          <div key={index} className="flex gap-3 mb-2">
            <input
              placeholder={`CO ${index + 1}`}
              value={item.co}
              onChange={(e) => handleDefinitionChange(index, "co", e.target.value)}
              className="border rounded p-2 w-1/3"
            />
            <input
              placeholder="Definition"
              value={item.definition}
              onChange={(e) => handleDefinitionChange(index, "definition", e.target.value)}
              className="border rounded p-2 w-2/3"
            />
          </div>
        ))}
        <button onClick={handleAddDefinition} className="bg-gray-700 text-white px-4 py-2 rounded">
          + Add More
        </button>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900"
      >
        Upload and Analyze
      </button>

      {response && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Server Response</h2>
          <pre className="bg-gray-100 p-4 mt-2 rounded max-h-96 overflow-auto text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>

          {response.results && response.results.length > 0 && (
            <div
              className="mt-8 border-t pt-6 flex gap-6 outline-none"
              ref={responseContainerRef}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  setSelectedIndex((prev) => Math.min(prev + 1, response.results.length - 1));
                } else if (e.key === "ArrowUp") {
                  setSelectedIndex((prev) => Math.max(prev - 1, 0));
                }
              }}
            >
              <div className="w-1/4 border-r pr-4 max-h-[400px] overflow-y-auto">
                {response.results.map((item, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    onClick={() => setSelectedIndex(idx)}
                    className={`cursor-pointer p-2 rounded mb-1 ${
                      selectedIndex === idx
                        ? "bg-yellow-300 font-semibold"
                        : "hover:bg-yellow-100"
                    }`}
                  >
                    <strong>{item.question}</strong> - {item.co}
                  </div>
                ))}
              </div>
              <div className="w-3/4 pl-4 max-h-[400px] overflow-y-auto">
                <h3 className="text-lg font-bold mb-2">
                  Improvement for {response.results[selectedIndex].question} (
                  {response.results[selectedIndex].co})
                </h3>
                <p>{response.results[selectedIndex].improvement}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Upload;
