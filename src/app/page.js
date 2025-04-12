"use client";

import Editor from "@monaco-editor/react";
import React, { useEffect, useState, useRef } from "react";
import style from "./page.scss";
import parse from "html-react-parser";
import ai from "./getGoogleGenAI";

export default function Home() {
    const [code, setCode] = useState("console.log('Hello World')");
    // const [output, setOutput] = useState("");

    const [questions, setQuestions] = useState([]);
    const [currentQuestions, setCurrentQuestions] = useState([]);

    const [question, setQuestion] = useState("");
    const [questionMeta, setQuestionMeta] = useState({});
    const [aiAnswer, setAiAnswer] = useState("");

    // const [pages, setPages] = useState([1]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [submissionResult, setSubmissionResult] = useState("");
    const [language, setLanguage] = useState("javascript");

    const inputRef = useRef();

    useEffect(() => {
        setCurrentQuestions(
            questions.slice((currentPage - 1) * 20, currentPage * 20)
        );

        inputRef.current.value = currentPage;
    }, [currentPage]);

    useEffect(() => {
        setCurrentQuestions(
            questions.slice((currentPage - 1) * 20, currentPage * 20)
        );

        // setMaxPage(Math.ceil(questions.length / 20));
    }, [questions]);

    const questionOnClickHandler = async (id, event) => {
        const questoinSelected = questions[id - 1];

        const res = await fetch("/api/showQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                titleSlug: questoinSelected.titleSlug,
                code: false,
            }),
        });

        const data = await res.json();

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

        setQuestionMeta({
            titleSlug: questoinSelected.titleSlug,
            id: id,
            title: questoinSelected.title,
        });
        setQuestion(data.output);

        if (questoinSelected.status !== "ac") {
            const res1 = await fetch("/api/showQuestion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    titleSlug: questions[id - 1].titleSlug,
                    code: true,
                }),
            });

            const data1 = await res1.json();

            setCode(data1.output);
        } else {
            const res2 = await fetch("/api/getSubmission", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    titleSlug: questoinSelected.titleSlug,
                }),
            });

            const data2 = await res2.json();
            setCode(data2.output);

            var lang = language;
            switch (data2.language) {
                case "python3":
                    lang = "python";
                    break;

                default:
                    lang = data2.language;
            }
            // console.log(lang);
            setLanguage(lang);
        }
    };

    const handlePrevOnClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextOnClick = () => {
        if (currentPage + 1 <= maxPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageOnSubmit = (event) => {
        event.preventDefault();

        var inputPage = parseInt(inputRef.current.value);
        if (inputPage <= maxPage) {
            setCurrentPage(inputPage);
        } else {
            inputRef.current.value = currentPage;
        }
    };

    const questionLi = currentQuestions.map((q, index) => (
        <li
            key={index}
            // id={parseInt(q.description.split("[")[1].split("]")[0].trim())}
            id={parseInt(q.frontendQuestionId)}
            onClick={() => {
                questionOnClickHandler(parseInt(q.frontendQuestionId));
            }}
            className="page-item"
        >
            <div>{`${q.frontendQuestionId}. ${q.status === "ac" ? "✅" : "x"} ${
                q.title
            }`}</div>{" "}
            <div>{`${q.difficulty} (${q.acRate.toFixed(2)}%)`}</div>
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
        // setQuestions(data.output || data.error);
        if (!data.error) {
            setQuestions(data.questions);
            setMaxPage(Math.ceil(data.total / 20));
        } else {
            console.log(data.error);
        }
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

    const runCode = async () => {
        // try {
        //     const logs = [];
        //     const originalLog = console.log;
        //     console.log = (...args) => logs.push(args.join(" "));
        //     eval(code);
        //     console.log = originalLog;
        //     setOutput(logs.join("\n"));
        // } catch (err) {
        //     setOutput(err.toString());
        // }
        // send code to backend
        const res = await fetch("/api/submitCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, questionMeta, language }),
        });

        const data = await res.json();
        setSubmissionResult(data.output);
    };

    return (
        <div className="editor-container">
            <h2 className="text-center">JavaScript Code Editor</h2>
            <button onClick={handleGetQuestions}>Get questions</button>

            <nav aria-label="Page navigation">
                <ul className="pagination">
                    <li
                        className={`page-item ${
                            currentPage == 1 ? "disabled" : ""
                        }`}
                        onClick={handlePrevOnClick}
                    >
                        <div className="page-link" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                            {/* <span className="sr-only">Previous</span> */}
                        </div>
                    </li>
                    <li className="page-item">
                        <form className="d-flex" onSubmit={handlePageOnSubmit}>
                            <input
                                type="number"
                                min="1"
                                ref={inputRef}
                                className="page-link"
                                defaultValue={currentPage}
                            />
                            <button type="submit">Go</button>
                        </form>
                    </li>
                    <li
                        className={`page-item ${
                            currentPage == maxPage ? "disabled" : ""
                        }`}
                        onClick={handleNextOnClick}
                    >
                        <div className="page-link" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                            {/* <span className="sr-only">Next</span> */}
                        </div>
                    </li>
                </ul>
            </nav>

            <ul className="question-list">{questionLi}</ul>
            <div className="question-container">{parse(question)}</div>

            <Editor
                height="300px"
                defaultLanguage={"javascript"}
                language={language}
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
                        <pre className="output">{submissionResult}</pre>
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
