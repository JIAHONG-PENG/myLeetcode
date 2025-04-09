"use client";

import Editor from "@monaco-editor/react";
import React, { useState } from "react";
import style from "./page.scss";
import parse from "html-react-parser";
import { GoogleGenAI } from "@google/genai";

export default function Home() {
    const [code, setCode] = useState("console.log('Hello World')");
    const [output, setOutput] = useState("");
    const [questions, setQuestions] = useState([]);
    const [question, setQuestion] = useState("");
    const ai = new GoogleGenAI({
        apiKey: "AIzaSyDLm1SFdlhk6Y0PbWsgmIh6pf48ppGBbYc",
    });
    const [aiAnswer, setAiAnswer] = useState("");

    // const cutLineBreak = (text) => {
    //     // for (let n = 5; n > 1; n--) {
    //     while (text.includes("\n\n\n")) {
    //         console.log(3);
    //         text = text.replaceAll("\n\n\n", "\n");
    //     }
    //     console.log(text);
    //     return text;
    // };

    const questionOnClickHandler = async (id, event) => {
        var res = await fetch("/api/showQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                code: false,
            }),
        });

        var data = await res.json();

        data.output = data.output
            .split("\n\n")
            .filter((line) => line.trim() !== "") // remove empty lines
            .join("\n");

        // data.output = cutLineBreak(data.output);

        data.output = data.output
            .replaceAll(/\n/g, "<br>")
            .replaceAll("<p>&nbsp;</p>", "");

        data.output = data.output
            .split("Constraints")
            .join("<div className='line'></div> Constraints");

        data.output = data.output
            .split("Example")
            .join("<div className='line'></div> Example");
        setQuestion(data.output);

        var res = await fetch("/api/showQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                code: true,
            }),
        });

        var data = await res.json();

        setCode(data.output);
    };

    const questionLi = questions.map((q, index) => (
        <li
            key={index}
            id={parseInt(q.description.split("[")[1].split("]")[0].trim())}
            onClick={() => {
                questionOnClickHandler(
                    parseInt(q.description.split("[")[1].split("]")[0].trim())
                );
            }}
        >
            <div>{q.description}</div> <div>{q.level}</div>
        </li>
    ));

    const handleGetQuestions = async (event) => {
        const res = await fetch("/api/getQuestions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();
        // data.output = data.output.map((q) =>
        //     q.includes("✔") ? q : "&nbsp;&nbsp;" + q
        // );
        setQuestions(data.output || data.error);
    };

    const askAiButtonOnClick = async () => {
        if (question !== "") {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents:
                    `${question} \n Can you give some hints of this question, but not the anser of it.`.replaceAll(
                        "<br>",
                        " "
                    ),
            });

            setAiAnswer(response.text);
        }
    };

    const runCode = () => {
        try {
            const logs = [];
            const originalLog = console.log;
            console.log = (...args) => logs.push(args.join(" "));
            eval(code);
            console.log = originalLog;
            setOutput(logs.join("\n"));
        } catch (err) {
            setOutput(err.toString());
        }
    };

    return (
        <div className="editor-container">
            <h2 className="text-center">JavaScript Code Editor</h2>
            <button onClick={handleGetQuestions}>Get questions</button>
            <ul className="question-list">{questionLi}</ul>
            <div className="question-container">{parse(question)}</div>
            <Editor
                height="300px"
                defaultLanguage="javascript"
                defaultValue={code}
                value={code}
                onChange={(value) => setCode(value)}
                theme="vs-dark"
            />
            <button onClick={runCode}>Run</button>

            <div className="container-xl pd-0">
                <br />
                <div className="row">
                    <div className="col-md-6 col-12">
                        <h4>Output:</h4>
                        <pre className="output">{output}</pre>
                    </div>
                    <div className="col-md-6 col-12">
                        <button onClick={askAiButtonOnClick}>Ask AI</button>
                        <div className="ai-answer-box">{aiAnswer}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
