import { Tabs, TabList, Tab, TabPanel } from "./react-patterns/compound-tabs/Tabs";
import { Autocomplete } from "./ui-components/autocomplete/Autocomplete";

const FRUITS = [
  "Apple",
  "Apricot",
  "Banana",
  "Blueberry",
  "Cherry",
  "Grape",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
];

/**
 * A small gallery so `npm run dev` renders the solutions that have a UI.
 * Pure-JS patterns (e.g. debounce) live under src/js-patterns with tests.
 */
export function App() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 640,
        margin: "40px auto",
        padding: "0 16px",
      }}
    >
      <h1>common-problems</h1>
      <p>Solutions to common front-end patterns problems. Run `npm test`.</p>

      <section style={{ marginTop: 32 }}>
        <h2>Compound Tabs (React pattern)</h2>
        <Tabs defaultValue="react">
          <TabList>
            <Tab value="react">React patterns</Tab>
            <Tab value="ui">UI components</Tab>
            <Tab value="js">JS utilities</Tab>
          </TabList>
          <TabPanel value="react">
            Context-based compound components: state shared implicitly, no
            prop-drilling.
          </TabPanel>
          <TabPanel value="ui">
            Accessible, keyboard-navigable widgets built from scratch.
          </TabPanel>
          <TabPanel value="js">
            Vanilla JS interview utilities with edge cases covered by tests.
          </TabPanel>
        </Tabs>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Autocomplete (UI component)</h2>
        <Autocomplete options={FRUITS} placeholder="Search fruit…" />
      </section>
    </main>
  );
}
