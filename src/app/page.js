"use client";

import Editor from "@monaco-editor/react";
import React, { useEffect, useState, useRef } from "react";
import style from "./page.scss";
import parse from "html-react-parser";
import ai from "./getGoogleGenAI";

export default function Home() {
    const [code, setCode] = useState("console.log('Hello World')");
    // const [output, setOutput] = useState("");

    const [username, setUsername] = useState();
    const [allQuestions, setAllQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState({});
    const [currentQuestions, setCurrentQuestions] = useState([]);

    const [question, setQuestion] = useState("");
    const [questionMeta, setQuestionMeta] = useState({});
    const [aiAnswer, setAiAnswer] = useState("");
    const [solutions, setSolutions] = useState([]);
    const [solution, setSolution] = useState({ content: "", title: "" });

    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [submissionResult, setSubmissionResult] = useState("");
    const [language, setLanguage] = useState("javascript");

    const [memoryPercentile, setMemoryPercentile] = useState(0);
    const [runtimePercentile, setRuntimePercentile] = useState(0);

    const LANGUAGES = ["javascript", "python", "c++"];
    const SOLVED_STATUS = "SOLVED";

    const inputRef = useRef();
    const languageSelectRef = useRef();

    const POST = async function (url, body) {
        return await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    };

    function decodeEscapedString(str) {
        return (
            str
                // Decode \uXXXX unicode
                .replace(/\\u[\dA-Fa-f]{4}/g, (match) =>
                    String.fromCharCode(parseInt(match.slice(2), 16))
                )
                // Decode \xXX hex escapes
                .replace(/\\x[0-9A-Fa-f]{2}/g, (match) =>
                    String.fromCharCode(parseInt(match.slice(2), 16))
                )
                // Replace escaped newlines
                .replace(/\\n/g, "\n")
                // Replace escaped single quotes
                .replace(/\\'/g, "'")
                // Replace escaped double quotes
                .replace(/\\"/g, '"')
                // Replace escaped backslashes
                .replace(/\\\\/g, "\\")
                // Replace <br> with newlines
                .replace(/<br\s*\/?>/gi, "\n")
                // Replace actual non-breaking space characters
                .replace(/\u00A0/g, " ")
                .replace(/\xa0/g, " ")
        );
    }

    useEffect(() => {
        async function authenticate() {
            const res = await fetch("/api/authUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { isSignedIn, username } = await res.json();
            if (isSignedIn) {
                setUsername(username);
            }
        }
        authenticate();
    }, []);

    useEffect(() => {
        if (Array.isArray(questions)) {
            setCurrentQuestions(
                questions.slice((currentPage - 1) * 20, currentPage * 20)
            );
        }

        inputRef.current.value = currentPage;
    }, [currentPage, questions]);

    // useEffect(() => {
    //     if (Array.isArray(questions)) {
    //         setCurrentQuestions(
    //             questions.slice((currentPage - 1) * 20, currentPage * 20)
    //         );
    //     }
    // }, [questions]);

    const languageOptionList = LANGUAGES.map((lan, index) => (
        <option value={lan} key={index}>
            {lan}
        </option>
    ));

    const handleGetSolution = async (event) => {
        const res = await POST("/api/getSolution", {
            topicId: event.target.id,
        });
        const data = await res.json();
        data.content = decodeEscapedString(data.content);
        setSolution(data);
    };

    const solutionsLi = solutions.map(({ topicId, title }, index) => (
        <li key={index} id={topicId} onClick={handleGetSolution}>
            {title}
        </li>
    ));

    function languageOnChangeHandler(event) {
        setLanguage(event.target.value);
    }

    const categoryOnClickHandler = (event) => {
        if (event.target.id == "all") {
            setQuestions(allQuestions);
            setCurrentPage(1);
            setMaxPage(Math.ceil(allQuestions.length / 20));
        } else {
            const topicSlug = event.target.id;
            let newQuestions = [];

            for (const q of allQuestions) {
                for (let topic of q.topicTags) {
                    topic = topic.slug;

                    if (topic == topicSlug) {
                        newQuestions.push(q);
                        break;
                    }
                }
            }

            setQuestions(newQuestions);
            setCurrentPage(1);
            setMaxPage(Math.ceil(newQuestions.length / 20));
        }
    };

    const questionOnClickHandler = async (id, event) => {
        const questoinSelected = allQuestions[id - 1];

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

        if (questoinSelected.status !== SOLVED_STATUS) {
            const res1 = await fetch("/api/showQuestion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    titleSlug: questoinSelected.titleSlug,
                    code: true,
                }),
            });

            const data1 = await res1.json();
            setRuntimePercentile(0);
            setMemoryPercentile(0);
            setLanguage("javascript");
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
            setRuntimePercentile(data2.runtimePercentile.toFixed(2));
            setMemoryPercentile(data2.memoryPercentile.toFixed(2));
            setLanguage(lang);
            languageSelectRef.current.value = lang;
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

    const questionLi = !Array.isArray(questions)
        ? questions
        : currentQuestions.map((q, index) => (
              <li
                  key={index}
                  // id={parseInt(q.description.split("[")[1].split("]")[0].trim())}
                  id={parseInt(q.questionFrontendId)}
                  onClick={() => {
                      questionOnClickHandler(parseInt(q.questionFrontendId));
                  }}
                  className="page-item"
              >
                  <div>{`${q.questionFrontendId}. ${
                      q.status === SOLVED_STATUS ? "✅" : "❌"
                  } ${q.title}`}</div>{" "}
                  <div>
                      <span className={q.difficulty}>{`${q.difficulty}`}</span>{" "}
                      {`(${(q.acRate * 100).toFixed(0)}%)`}
                  </div>
              </li>
          ));

    const categoryLi = Object.entries(categories).map(([key, value], index) => (
        <li
            key={index}
            id={key}
            onClick={categoryOnClickHandler}
        >{`${key} (${value})`}</li>
    ));

    const handleGetQuestions = async (event) => {
        const res = await fetch("/api/getQuestions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!data.error) {
            setQuestions(data.questions);
            setAllQuestions(data.questions);
            setCategories(data.categories);
            setMaxPage(Math.ceil(data.questions.length / 20));
            inputRef.current.value = 1;

            // if (!document.querySelector(".session-form")) {
            //     let newForm = document.createElement("form");
            //     // newForm.action = "/api/setSession";
            //     newForm.setAttribute("method", "POST");
            //     newForm.classList.add("session-form");

            //     let csrfText = document.createElement("label");
            //     csrfText.innerHTML = "csrfToken:";
            //     csrfText.setAttribute("for", "csrfToken");

            //     let cookieText = document.createElement("label");
            //     cookieText.innerHTML = "cookie:";
            //     cookieText.setAttribute("for", "cookie");

            //     let csrfInput = document.createElement("input");
            //     csrfInput.name = "csrfToken";

            //     let cookieInput = document.createElement("input");
            //     cookieInput.name = "cookie";

            //     let button = document.createElement("button");
            //     button.type = "submit";
            //     button.innerHTML = "Submit";

            //     newForm.appendChild(csrfText);
            //     newForm.appendChild(csrfInput);
            //     newForm.appendChild(sessionText);
            //     newForm.appendChild(sessionInput);
            //     newForm.appendChild(button);
            //     document
            //         .querySelector(".editor-container")
            //         .appendChild(newForm);

            //     newForm.addEventListener("submit", async (event) => {
            //         event.preventDefault();

            //         const formData = new FormData(newForm);

            //         const res = await fetch("/api/setSession", {
            //             method: "POST",
            //             headers: {
            //                 "Content-Type": "application/json",
            //             },
            //             body: JSON.stringify({
            //                 cookie: formData.get("cookie"),
            //                 csrfToken: formData.get("csrfToken"),
            //             }),
            //         });
            //     });
            // }
        } else {
            console.log(data.error);
            setQuestions(data.error);
            inputRef.current.value = 1;
        }
    };

    const handleGetAllSolutions = async () => {
        const res = await POST("/api/getSolutions", {
            questionSlug: questionMeta.titleSlug,
        });
        const data = await res.json();

        setSolutions(data.solutionTitles);
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
        try {
            if (language == "javascript") {
                const logs = [];
                const originalLog = console.log;
                console.log = (...args) => logs.push(args.join(" "));
                eval(code);
                console.log = originalLog;
                setSubmissionResult(logs.join("\n"));
            } else if (language == "python") {
                const res = await fetch("/api/runPython", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code,
                    }),
                });

                const data = await res.json();
                console.log(data);
                setSubmissionResult(data.output || data.error);
            } else if (language == "c++") {
            }
        } catch (err) {
            setSubmissionResult(err.toString());
        }
    };

    const submitCode = async () => {
        // send code to backend
        const res = await fetch("/api/submitCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, questionMeta, language }),
        });

        const data = await res.json();
        const status = res.status;

        if (status === 500) {
            setSubmissionResult("Error");
        } else {
            setSubmissionResult(data.output);
        }
    };

    return (
        <div className="editor-container">
            <div className="heading">
                <h2 className="text-center">My LeetCode</h2>
                <div className="username">User: {username || "None"}</div>
            </div>

            <section id="questions">
                <h3 className="underline">Question List</h3>
                <button onClick={handleGetQuestions}>Get questions</button>

                <ul className="question-category">{categoryLi}</ul>

                <nav aria-label="Page navigation" className="page-navigation">
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
                            <form
                                className="d-flex"
                                onSubmit={handlePageOnSubmit}
                            >
                                <input
                                    type="number"
                                    min="1"
                                    ref={inputRef}
                                    className="page-link no-spinner"
                                    defaultValue={currentPage}
                                />
                                <div className="cursor-default">
                                    &nbsp;...&nbsp;
                                </div>
                                <input
                                    type="number"
                                    value={maxPage}
                                    disabled
                                    className="page-link no-spinner"
                                />
                                <button type="submit" className="">
                                    Go
                                </button>
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
            </section>

            <br />

            <button>Display column</button>
            <section id="question-detail-and-editor" className="row">
                <div className="col-12 col-xl-6">
                    <h3 className="underline">Question Details</h3>
                    <div className="question-container">{parse(question)}</div>
                </div>
                {/* <br /> */}

                <div className="col-12 col-xl-6">
                    <h3 className="underline">Code Editor</h3>
                    <select
                        onChange={languageOnChangeHandler}
                        className="mb-3"
                        ref={languageSelectRef}
                    >
                        {languageOptionList}
                    </select>
                    {/* <div>{language}</div> */}
                    <Editor
                        className="editor"
                        height="80vh"
                        // defaultLanguage={"javascript"}
                        language={language}
                        // defaultValue={code}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                    />

                    <br />

                    <div className="d-flex justify-content-between">
                        <div>
                            <button onClick={runCode}>Run</button>
                            <br />
                            <button onClick={submitCode}>
                                Submit to LeetCode
                            </button>
                            <br />
                            <button onClick={handleGetAllSolutions}>
                                Get Solutions
                            </button>
                        </div>
                        <div>
                            <div>
                                <b>Runtime beats:</b> {runtimePercentile}%
                            </div>
                            <div>
                                <b>Memory beats:</b> {memoryPercentile}%
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <br />

            <section id="output">
                <div className="container-xl pd-0">
                    <br />
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <h4>Output:</h4>
                            <pre className="output">{submissionResult}</pre>

                            <ol className="solutions">{solutionsLi}</ol>
                        </div>
                        <div className="col-md-6 col-12">
                            <button onClick={askAiButtonOnClick}>Ask AI</button>
                            <div className="ai-answer-box">{aiAnswer}</div>

                            <div className="solution">{solution.content}</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
