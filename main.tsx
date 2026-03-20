import { useState, useCallback } from "react";

type ButtonConfig = {
  label: string;
  value: string;
  type: "number" | "operator" | "action" | "equals" | "decimal";
  wide?: boolean;
};

const buttons: ButtonConfig[][] = [
  [
    { label: "AC", value: "clear", type: "action" },
    { label: "+/-", value: "negate", type: "action" },
    { label: "%", value: "%", type: "operator" },
    { label: "÷", value: "/", type: "operator" },
  ],
  [
    { label: "7", value: "7", type: "number" },
    { label: "8", value: "8", type: "number" },
    { label: "9", value: "9", type: "number" },
    { label: "×", value: "*", type: "operator" },
  ],
  [
    { label: "4", value: "4", type: "number" },
    { label: "5", value: "5", type: "number" },
    { label: "6", value: "6", type: "number" },
    { label: "−", value: "-", type: "operator" },
  ],
  [
    { label: "1", value: "1", type: "number" },
    { label: "2", value: "2", type: "number" },
    { label: "3", value: "3", type: "number" },
    { label: "+", value: "+", type: "operator" },
  ],
  [
    { label: "0", value: "0", type: "number", wide: true },
    { label: ".", value: ".", type: "decimal" },
    { label: "=", value: "=", type: "equals" },
  ],
];

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const calculate = (a: number, op: string, b: number): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : NaN;
      case "%": return a % b;
      default: return b;
    }
  };

  const formatDisplay = (val: number): string => {
    if (isNaN(val)) return "Error";
    if (!isFinite(val)) return "Error";
    const str = val.toPrecision(12);
    const num = parseFloat(str);
    return String(num);
  };

  const handleButton = useCallback((btn: ButtonConfig) => {
    if (btn.value === "clear") {
      setDisplay("0");
      setExpression("");
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      setJustEvaluated(false);
      return;
    }

    if (btn.value === "negate") {
      const val = parseFloat(display);
      if (!isNaN(val)) {
        const negated = String(-val);
        setDisplay(negated);
      }
      return;
    }

    if (btn.type === "number") {
      if (waitingForOperand || justEvaluated) {
        setDisplay(btn.value);
        setWaitingForOperand(false);
        setJustEvaluated(false);
      } else {
        setDisplay(display === "0" ? btn.value : display + btn.value);
      }
      return;
    }

    if (btn.type === "decimal") {
      if (waitingForOperand || justEvaluated) {
        setDisplay("0.");
        setWaitingForOperand(false);
        setJustEvaluated(false);
        return;
      }
      if (!display.includes(".")) {
        setDisplay(display + ".");
      }
      return;
    }

    if (btn.type === "operator" || btn.value === "%") {
      const current = parseFloat(display);
      if (prevValue !== null && operator && !waitingForOperand) {
        const result = calculate(parseFloat(prevValue), operator, current);
        const formatted = formatDisplay(result);
        setDisplay(formatted);
        setPrevValue(formatted);
        setExpression(formatted + " " + btn.label + " ");
      } else {
        setPrevValue(display);
        setExpression(display + " " + btn.label + " ");
      }
      setOperator(btn.value);
      setWaitingForOperand(true);
      setJustEvaluated(false);
      return;
    }

    if (btn.type === "equals") {
      if (prevValue !== null && operator) {
        const current = parseFloat(display);
        const result = calculate(parseFloat(prevValue), operator, current);
        const formatted = formatDisplay(result);
        setExpression(expression + display + " =");
        setDisplay(formatted);
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setJustEvaluated(true);
      }
      return;
    }
  }, [display, prevValue, operator, waitingForOperand, justEvaluated, expression]);

  const displayFontSize =
    display.length > 12
      ? "text-3xl"
      : display.length > 8
      ? "text-4xl"
      : "text-5xl";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
          {/* Display */}
          <div className="px-6 pt-8 pb-4 min-h-[140px] flex flex-col items-end justify-end">
            <div className="text-gray-500 text-sm h-5 mb-1 truncate w-full text-right">
              {expression || "\u00A0"}
            </div>
            <div className={`${displayFontSize} font-light text-white tracking-tight truncate w-full text-right`}>
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-px bg-gray-800 border-t border-gray-800">
            {buttons.map((row, rowIdx) =>
              row.map((btn, colIdx) => {
                const isWide = btn.wide;
                const isOperator = btn.type === "operator";
                const isEquals = btn.type === "equals";
                const isAction = btn.type === "action";

                let bgClass = "bg-gray-700 hover:bg-gray-600 text-white";
                if (isAction) bgClass = "bg-gray-500 hover:bg-gray-400 text-black";
                if (isOperator || btn.value === "%") bgClass = "bg-orange-500 hover:bg-orange-400 text-white";
                if (isEquals) bgClass = "bg-orange-500 hover:bg-orange-400 text-white";

                if (operator === btn.value && waitingForOperand && !isEquals) {
                  bgClass = "bg-white hover:bg-gray-100 text-orange-500";
                }

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => handleButton(btn)}
                    className={`
                      ${isWide ? "col-span-2" : "col-span-1"}
                      ${bgClass}
                      py-5 text-2xl font-medium
                      active:brightness-75
                      transition-all duration-75
                      select-none cursor-pointer
                      flex items-center
                      ${isWide ? "justify-start pl-8" : "justify-center"}
                    `}
                  >
                    {btn.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
