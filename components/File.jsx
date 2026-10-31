import { createContext, useContext, useEffect, useState } from "react";

/**
 * Question 1
 * Which state describes the effect of the code below
 */
const MyComponent = () => {
  let counter = 1;
  useEffect(() => {
    console.log("Hello");
  }, [counter]);

  return (
    <div>
      <button
        onClick={() => {
          counter = counter + 1;
        }}
      >
        Click Me
      </button>
    </div>
  );
};

/**
 * A. The message "Hello" is printed once when MyComponent is mounted
 * B. The message "Hello" is printed when MyComponent is mounted and each time the button is clicked
 * C. The message "Hello" is never printed
 * D. The message "Hello" is printed only when the button is clicked
 * */

/**
 * Question 2
 *  * Considering the Code below, which value will be displayed inside the button after it is clicked?
 */
const Context = createContext();

const MyGrandChild = () => {
  const { fruit, setFruit } = useContext(Context);
  return <button onClick={() => setFruit("banana")}>{fruit}</button>;
};

const MyChild = () => {
  return <MyGrandChild />;
};

const MyParent = () => {
  const [fruit, setFruit] = useState("apple");
  return (
    <Context.Provider value={{ fruit, setFruit }}>
      <MyChild />
    </Context.Provider>
  );
};

/**
 * A. undefined
 * B. apple
 * C. [Object Object]
 * D. banana
 *   */

/**
 * Question 3
 * Which statement is true about the code above
 */
const MyFunction = () => {};

const MyComponent2 = () => {
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    MyFunction();
    setCounter((c) => c + 1);
  });

  return <div>{counter}</div>;
};

/**
 * A. myFunction is called infinitely
 * B. myFunction is called once
 * C. myFunction is called twice
 * D. myFunction is never called
 */

/**
 * Question 4
 * Considering the code above, which value is printed to the console if the user chooses the second "select" option then clicks the button
 */
const MyComponent3 = () => {
  let value;
  const submit = () => {
    console.log(value);
  };

  return (
    <>
      <button onClick={submit}>Submit</button>
      <select
        onChange={(e) => {
          value = e.target.value;
        }}
      >
        <option value="1">Option1</option>
        <option value="2">Option2</option>
      </select>
    </>
  );
};

/**
 * A. Option2
 * B. 1
 * C. 2
 * D. undefined
 */

/**
 * Question 5
 * Considering the code below, what will happen when the component MyComponent is mounted?
 */

const fetchData = () =>
  new Promise((r) =>
    setTimeout(() => {
      r(["one", "two"]);
    }, 1000),
  );

const MyComponent4 = () => {
  const [result, setResult] = useState();
  useEffect(() => {
    fetchData().then((value) => setResult(value));
  }, []);

  return <div>{result.length}</div>;
};
/**
 * A. Only the value 2 will be displayed
 * B. The value 0 will be displayed for one second then the value 2
 * C. Only the value 0 will be displayed
 * D. An error. Cannot read propery "length" of undefined
 */

/**
 * Question 6
 * You want to add the component TripleValue inside the component Container as shown in the code below
 * Where should the 'value' state be created to avoid using multiple states?
 */

const DoubleValue = ({ value }) => <>{value * 2}</>;
const TrippleValue = ({ value }) => <>{value * 3}</>;

const MyChild2 = () => {
  const [value, setValue] = useState(1);

  return (
    <>
      <button onClick={() => setValue(value * 2)}>Scale</button>
      <DoubleValue value={value} />
    </>
  );
};

const Container = () => {
  return (
    <>
      <MyChild2 />
      {/**Add TrippleValue here */}
    </>
  );
};

/**
 * A. TripleValue component
 * B. MyChild component
 * C. Container component
 * D. DoubleValue component
 */

/**
 * Question 7
 * What is the value of the variable 'state' after the button is clicked two times?
 */

const MyComponent5 = ({ children }) => {
  const [state, setState] = useState("one");
  const C = children;

  const append = () => setState((s) => s + "one");

  return (
    <div>
      {state}
      <C onClick={append} value={state} />
    </div>
  );
};

const MyApp = () => {
  return (
    <MyComponent>
      {({ onClick }) => {
        return <button onClick={onClick}>Click me</button>;
      }}
    </MyComponent>
  );
};

/**
 * A. An empty string
 * B. oneone
 * C. oneoneone
 * D. one
 */

/**
 * Question 8
 * What does the high-order component below achieve?
 */

const withHOC = (C) => (props) => {
  const [activated, setActivated] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setActivated(true);
    }, 2000);
  }, []);

  return (
    <div style={!activated ? { display: "none" } : {}}>
      <C onClick={(m) => m} {...props} />
    </div>
  );
};

/**
 * A. It shows a React component for two seconds then hide it
 * B. It hides a React component forever
 * C. it hides a React component for two seconds then displays it.
 * D. it hides a React component when clicked
 */

/**
 * Question 10
 * Considering the code below, what is the reason you might get the error
 * "Can't perform a React state update on an unmounted component"?
 */

const MyApp3 = () => {
  const [fruit, setFruit] = useState("orange");
  useEffect(() => {
    setTimeout(() => {
      setFruit("apple");
    }, 2000);
  }, []);

  return <div>{fruit}</div>;
};

/**
 * A. The function setFruit is called before MyApp3 has finished rendering
 * B. The component is unmounted before useEffect is called
 * C. The component is unmounted before the timeout is finished
 * D. The component is unmounted after the timeout is finished
 */

/**
 * Question 11
 * Considering the components below, which message is displayed on the screen after the component MyApp4 is rendered?
 */

class MyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.body || <div>Error</div>;
    return this.props.children;
  }
}

const MyComponent6 = () => {
  const a = undefined;
  setTimeout(() => console.log("field"), 100);
  return <div>test</div>;
};

const MyApp4 = () => (
  <MyErrorBoundary>
    <MyComponent6></MyComponent6>
  </MyErrorBoundary>
);

/**
 * A. None the code will result in a error
 * B. a['field]
 * C. test
 * D. Error
 */

/**
 * Question 12
 * Considering the code below, what should be returned from the Column component so that the parent-child relationship isn't broken?
 */

const Table = () => {
  return (
    <table>
      <tr>
        <Column />
      </tr>
    </table>
  );
};

const Column = () => {
  /* return statement here*/
};

/**
 * A. return (
 * <div>
 *  <td>Hello World!</td>
 *  <td>Hello Educative!</td>
 * </div>
 *)
 *
 *B. return (
 * <Table>
 *  <td>Hello World!</td>
 *  <td>Hello Educative!</td>
 * </Table>
 *)
 *
 * C. return (
 * <span>
 *  <td>Hello World!</td>
 *  <td>Hello Educative!</td>
 * </span>
 *)
 *
 * D. return (
 * <>
 *  <td>Hello World!</td>
 *  <td>Hello Educative!</td>
 * </>
 *)
 */
