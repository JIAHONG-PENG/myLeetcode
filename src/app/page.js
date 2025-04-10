"use client";

import Editor from "@monaco-editor/react";
import React, { useEffect, useState, useRef } from "react";
import style from "./page.scss";
import parse from "html-react-parser";
import ai from "./getGoogleGenAI";

export default function Home() {
    const [code, setCode] = useState("console.log('Hello World')");
    const [output, setOutput] = useState("");

    const [questions, setQuestions] = useState([]);
    const [currentQuestions, setCurrentQuestions] = useState([]);

    const [question, setQuestion] = useState("");
    const [aiAnswer, setAiAnswer] = useState("");

    const [pages, setPages] = useState([1]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);

    const inputRef = useRef();

    useEffect(() => {
        setCurrentQuestions(
            questions.slice((currentPage - 1) * 20, currentPage * 20)
        );

        inputRef.current.value = currentPage;

        //     var newPages = [];
        //     var i = currentPage - 2;
        //     while (newPages.length < 5) {
        //         if (i > 0) {
        //             if (i <= maxPage) {
        //                 newPages.push(i);
        //             }
        //         }
        //     }
        //     setPages(newPages);
    }, [currentPage]);

    useEffect(() => {
        setCurrentQuestions(
            questions.slice((currentPage - 1) * 20, currentPage * 20)
        );

        setMaxPage(Math.ceil(questions.length / 20));
    }, [questions]);

    // useEffect(() => {
    //     setMaxPage(Math.ceil(questions / 20));
    // }, [questions]);

    // const setQuestionsShown = (currentPage) => {
    //     setCurrentQuestions(
    //         questions.slice((currentPage - 1) * 20, currentPage * 20)
    //     );
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
            id={parseInt(q.description.split("[")[1].split("]")[0].trim())}
            onClick={() => {
                questionOnClickHandler(
                    parseInt(q.description.split("[")[1].split("]")[0].trim())
                );
            }}
            className="page-item"
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
        // setQuestionsShown(1);
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
