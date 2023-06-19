/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React, { useRef, useEffect } from "react";
import { createUseStyles } from "react-jss";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const useStyles = createUseStyles({

  container: {
    position: "relative",
    color: "var(--ft-color-loud)",
    borderBottom: 0
  },
  input: {
    color: "var(--ft-color-loud)",
    width: "calc(100% - 20px)",
    margin: "10px",
    border: "1px solid transparent",
    paddingLeft: "30px",
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    "&:focus":{
      color: "var(--ft-color-loud)",
      borderColor: "rgba(64, 169, 243, 0.5)",
      backgroundColor: "transparent"
    }
  },
  icon: {
    position: "absolute",
    top: "50%",
    left: "20px",
    transform: "translateY(-50%)",
    color: "var(--ft-color-normal)"
  }
});

interface FilterProps {
  value: string;
  placeholder?: string;
  icon?: IconProp;
  onChange: (value: string) => void;
}

const Filter = ({ value, placeholder="filter...", icon="search", onChange }: FilterProps) => {

  const classes = useStyles();

  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  return (
    <div className={classes.container}>
      <Form.Control
        ref={ref}
        className={`${classes.input} inputFilter`}
        type="text"
        onChange={handleChange}
        value={value}
        placeholder={placeholder} />
      <div className={classes.icon}>
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
  );
};

export default Filter;