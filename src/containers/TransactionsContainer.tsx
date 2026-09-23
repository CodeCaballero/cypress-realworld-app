import React from "react";
import { useMachine } from "@xstate/react";
import { Switch, Route } from "react-router";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import TransactionListFilters from "../components/TransactionListFilters";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import { getDateQueryFields, getAmountQueryFields } from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";
import TransactionPublicList from "../components/TransactionPublicList";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";

const TransactionsContainer: React.FC = () => {
  const [currentFilters, sendFilterEvent] = useMachine(transactionFiltersMachine);

  const hasDateRangeFilter = currentFilters.matches({ dateRange: "filter" });
  const hasAmountRangeFilter = currentFilters.matches({
    amountRange: "filter",
  });

  const dateRangeFilters = hasDateRangeFilter && getDateQueryFields(currentFilters.context);
  const amountRangeFilters = hasAmountRangeFilter && getAmountQueryFields(currentFilters.context);

  const Filters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
    />
  );

  const exportPersonalTransactions = async () => {
    const response = await httpClient.get(`http://localhost:${backendPort}/transactions/export`, {
      params: { ...dateRangeFilters, ...amountRangeFilters },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const PersonalFilters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
      onExport={exportPersonalTransactions}
    />
  );

  return (
    <Switch>
      <Route exact path="/contacts">
        <TransactionContactsList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
      <Route exact path="/personal">
        <TransactionPersonalList
          filterComponent={PersonalFilters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
      <Route exact path="/(public)?">
        <TransactionPublicList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
    </Switch>
  );
};

export default TransactionsContainer;
