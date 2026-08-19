import { useCallback, useState } from "react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  generateSecurePassword,
  type PasswordGeneratorOptions,
} from "../utils/passwordGenerator";

export default function Generator() {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generateSecurePassword(options)
  );

  const [copied, setCopied] = useState(false);

  const handleGeneratePassword = useCallback(() => {
    setGeneratedPassword(generateSecurePassword(options));
    setCopied(false);
  }, [options]);

  const handleOptionChange = useCallback(
    (option: keyof PasswordGeneratorOptions, value: boolean | number) => {
      setOptions((prevOptions) => ({
        ...prevOptions,
        [option]: value,
      }));
    },
    []
  );

  const handleCopy = async () => {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lengthItems = [
    { label: "16 chars", value: "16" },
    { label: "24 chars", value: "24" },
    { label: "32 chars", value: "32" },
    { label: "64 chars", value: "64" },
    { label: "128 chars", value: "128" },
    { label: "256 chars", value: "256" },
  ];

  const checkboxClass =
    "border border-zinc-600/80 rounded-md data-[state=checked]:bg-zinc-800 data-[state=checked]:border-zinc-400 data-[state=checked]:text-white focus-visible:ring-zinc-500 transition-colors";

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-zinc-950 text-white p-6 shadow-2xl border border-zinc-700/50 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center">Password Generator</h2>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/50">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-zinc-100 tracking-wide">
            Length:
          </span>
          <Select
            value={String(options.length)}
            onValueChange={(value) => handleOptionChange("length", Number(value))}
          >
            <SelectTrigger className="h-9 w-28 bg-zinc-950 text-white border border-zinc-700/50 font-medium focus:ring-zinc-600">
              <SelectValue placeholder="Length" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              <SelectGroup>
                {lengthItems.map((item) => (
                  <SelectItem 
                    key={item.value} 
                    value={item.value} 
                    className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-100 hover:text-white transition-colors">
            <Checkbox
              checked={options.uppercase}
              onCheckedChange={(checked) =>
                handleOptionChange("uppercase", !!checked)
              }
              className={checkboxClass}
            />
            <span className="font-semibold">A-Z</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-100 hover:text-white transition-colors">
            <Checkbox
              checked={options.lowercase}
              onCheckedChange={(checked) =>
                handleOptionChange("lowercase", !!checked)
              }
              className={checkboxClass}
            />
            <span className="font-semibold">a-z</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-100 hover:text-white transition-colors">
            <Checkbox
              checked={options.numbers}
              onCheckedChange={(checked) =>
                handleOptionChange("numbers", !!checked)
              }
              className={checkboxClass}
            />
            <span className="font-semibold">0-9</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-100 hover:text-white transition-colors">
            <Checkbox
              checked={options.symbols}
              onCheckedChange={(checked) =>
                handleOptionChange("symbols", !!checked)
              }
              className={checkboxClass}
            />
            <span className="font-semibold">!@#</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-200 hover:text-white transition-colors">
            <Checkbox
              checked={options.excludeAmbiguous}
              onCheckedChange={(checked) =>
                handleOptionChange("excludeAmbiguous", !!checked)
              }
              className={checkboxClass}
            />
            <span className="font-semibold">No Ambiguous</span>
          </label>
        </div>
      </div>
      <div className="relative rounded-xl bg-black border border-zinc-700/50 p-5 min-h-[5.5rem] flex items-center justify-between gap-4 shadow-inner">
        <span className="font-mono text-xl sm:text-2xl text-zinc-100 font-semibold tracking-wide break-all select-all">
          {generatedPassword}
        </span>
        <Button
          type="button"
          onClick={handleCopy}
          className="shrink-0 h-10 px-4 text-xs font-bold tracking-wide uppercase transition-all bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50 active:scale-95"
        >
          {copied ? "✓ Copied" : "Copy"}
        </Button>
      </div>
      <Button
        type="button"
        onClick={handleGeneratePassword}
        className="w-full h-12 text-base font-bold text-white shadow-lg transition-all active:scale-[0.99] bg-emerald-600 hover:bg-emerald-500"
      >
        Generate New Password
      </Button>
    </div>
  );
}