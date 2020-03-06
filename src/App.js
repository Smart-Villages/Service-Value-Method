/**
 * Service Value Method:  Provide visual indications what services to focus on given a list of participants with their
 *                        choices and additional decision criteria.
 *
 * @license AGPL-3.0-or-later
 *
 * Copyright (C) 2020 Thiemo Müller
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Start from "./Pages/Start";
import SelectServices from "./Pages/SelectServices";
import ConfigureRows from "./Pages/ConfigureRows";
import Result from "./Pages/Result";
import ResultWeb from "./Pages/ResultWeb";

/**
 * Provide a short explanation how to use it and ask the user to upload the CSV file. Result is the parsed CSV file.
 *
 * @type {string}
 */
const STEP_INTRODUCTION = "introduction";
/**
 * As the user to deselect any columns that aren't meant to be services.
 *
 * @type {string}
 */
const STEP_SERVICES = "services";
/**
 * Ask the user to define which ones of the rows are not participants but decision criteria -OR- the importance
 * (defining the bubble color). For decision criteria the user can also select how to label tha axis:
 * - better / worse
 * - easier / harder
 * - higher / lower
 *
 * @type {string}
 */
const STEP_ROWS = "rows";
/**
 * Finally draw the result as an SVG graphic.
 *
 * @type {string}
 */
const STEP_DISPLAY = "display";

/**
 * The container for the individual steps (see constants above).
 */
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      step: STEP_INTRODUCTION,
      show: "grid",
      services: null,
      selectedServices: null,
      serviceVotes: null,
      serviceVoters: null,
      data: null,
      participants: null,
      decisionCriteria: null,
      bubbleSizes: null,
    };
  }

  /**
   * Default render() callback.
   *
   * @returns {*}
   */
  render() {
    let content;

    if(this.state.step===STEP_INTRODUCTION) {
      content = (
        <Start
          onDone={(v) => {
            this.setState(v);
            this.setState({
              step: STEP_SERVICES,
            });
          }}
        />
      );
    }
    else if(this.state.step===STEP_SERVICES) {
      content = (
        <SelectServices
          back={() => {
            this.setState({
              step: STEP_INTRODUCTION,
            });
          }}
          selectedServices={this.state.selectedServices}

          services={this.state.services}
          onDone={(v) => {
            this.setState(v);
            this.setState({
              step: STEP_ROWS,
            });
          }}
        />
      );
    }
    else if(this.state.step===STEP_ROWS) {
      content = (
        <ConfigureRows
          back={() => {
            this.setState({
              step: STEP_SERVICES,
              participants: null,
              bubbleSizes: null,
              decisionCriteria: null,
              serviceVotes: null,
              serviceVoters: null,
            });
          }}
          participants={this.state.participants}
          bubbleSizes={this.state.bubbleSizes}
          decisionCriteria={this.state.decisionCriteria}
          serviceVotes={this.state.serviceVotes}
          serviceVoters={this.state.serviceVoters}

          selectedServices={this.state.selectedServices}
          data={this.state.data}
          onDone={(v) => {
            this.setState(v);
            this.setState({
              step: STEP_DISPLAY,
            });
          }}
          />
      );
    }
    else if(this.state.step===STEP_DISPLAY) {
      const show = (show) => {
        this.setState({
          show: show,
        });
      };
      if(this.state.show==="web") {
        content = (
          <ResultWeb
            back={() => {
              this.setState({
                step: STEP_ROWS,
              });
            }}

            decisionCriteria={this.state.decisionCriteria}
            serviceVotes={this.state.serviceVotes}
            serviceVoters={this.state.serviceVoters}
            selectedServices={this.state.selectedServices}
            bubbleSizes={this.state.bubbleSizes}
            show={show}
          />
        );
      }
      else if(this.state.show==="grid") {
        content = (
          <Result
            back={() => {
              this.setState({
                step: STEP_ROWS,
              });
            }}

            decisionCriteria={this.state.decisionCriteria}
            serviceVotes={this.state.serviceVotes}
            serviceVoters={this.state.serviceVoters}
            selectedServices={this.state.selectedServices}
            bubbleSizes={this.state.bubbleSizes}
            show={show}
          />
        );
      }
    }

    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;
