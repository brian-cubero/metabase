import { SAMPLE_DB_ID } from "__support__/e2e/cypress_data";

export function adhocQuestionHash(question) {
  if (question.display) {
    // without "locking" the display, the QB will run its picking logic and override the setting
    question = Object.assign({}, question, { displayIsLocked: true });
  }
  return btoa(unescape(encodeURIComponent(JSON.stringify(question))));
}

/**
 * Visit any valid query in an ad-hoc manner.
 *
 * @param {object} question
 * @param {{callback: function, mode: (undefined|"notebook")}} config
 */
export function visitQuestionAdhoc(question, { callback, mode } = {}) {
  const questionMode = mode === "notebook" ? "/notebook" : "";

  const [url, alias] = getInterceptDetails(question, mode);

  cy.intercept(url).as(alias);

  cy.visit(`/question${questionMode}#` + adhocQuestionHash(question));

  cy.wait("@" + alias).then(xhr => {
    callback && callback(xhr);
  });
}

/**
 * Open a table as an ad-hoc query in a simple or a notebook mode, and optionally limit the number of results.
 *
 * @param {{database:number, table: number, mode: (undefined|"notebook"), limit: number, callback: function}} config
 */
export function openTable({
  database = SAMPLE_DB_ID,
  table,
  mode = null,
  limit,
  callback,
} = {}) {
  visitQuestionAdhoc(
    {
      dataset_query: {
        database,
        query: {
          "source-table": table,
          limit,
        },
        type: "query",
      },
    },
    { mode, callback },
  );
}

export function openProductsTable({ mode, limit, callback } = {}) {
  return openTable({ table: 1, mode, limit, callback });
}

export function openOrdersTable({ mode, limit, callback } = {}) {
  return openTable({ table: 2, mode, limit, callback });
}

export function openPeopleTable({ mode, limit, callback } = {}) {
  return openTable({ table: 3, mode, limit, callback });
}

export function openReviewsTable({ mode, limit, callback } = {}) {
  return openTable({ table: 4, mode, limit, callback });
}

function getInterceptDetails(question, mode) {
  // When visiting notebook mode directly, we don't render any results to the page.
  // Therefore, there is no `dataset` to wait for.
  // But we need to make sure the schema for our database is loaded before we can proceed.
  if (mode === "notebook") {
    return [`/api/database/${SAMPLE_DB_ID}/schema/PUBLIC`, "publicSchema"];
  }

  const {
    display,
    dataset_query: { type },
  } = question;

  // native queries should use the normal dataset endpoint even when set to pivot
  const isPivotEndpoint = display === "pivot" && type === "query";

  const url = isPivotEndpoint ? "/api/dataset/pivot" : "/api/dataset";
  const alias = isPivotEndpoint ? "pivotDataset" : "dataset";

  return [url, alias];
}
