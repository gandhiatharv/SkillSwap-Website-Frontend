import { useState } from "react";
import skillsData from "./data/skills.json";
import aliasMap from "./data/alias-map.json";


function App() {
  // --- Learn section state ---
  const [categoryFilterLearn, setCategoryFilterLearn] = useState("");
  const [subcategoryFilterLearn, setSubcategoryFilterLearn] = useState("");
  const [tempSelectedLearn, setTempSelectedLearn] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [searchLearn, setSearchLearn] = useState("");

  // --- Teach section state ---
  const [categoryFilterTeach, setCategoryFilterTeach] = useState("");
  const [subcategoryFilterTeach, setSubcategoryFilterTeach] = useState("");
  const [tempSelectedTeach, setTempSelectedTeach] = useState([]);
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [searchTeach, setSearchTeach] = useState("");

  const [matches, setMatches] = useState([]);

  // Categories list
  const categories = [...new Set(skillsData.map((s) => s.category))].sort();

  // Subcategories for Learn and Teach filters
  const subcategoriesLearn = categoryFilterLearn
    ? [...new Set(skillsData.filter((s) => s.category === categoryFilterLearn).map((s) => s.subcategory))].sort()
    : [];
  const subcategoriesTeach = categoryFilterTeach
    ? [...new Set(skillsData.filter((s) => s.category === categoryFilterTeach).map((s) => s.subcategory))].sort()
    : [];

  // Filter skills for Learn multi-select based on filters (category/subcategory)
  const getFilteredSkillsLearn = () => {
    return skillsData
      .filter((s) => (categoryFilterLearn ? s.category === categoryFilterLearn : true))
      .filter((s) => (subcategoryFilterLearn ? s.subcategory === subcategoryFilterLearn : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Filter skills for Teach multi-select based on filters (category/subcategory)
  const getFilteredSkillsTeach = () => {
    return skillsData
      .filter((s) => (categoryFilterTeach ? s.category === categoryFilterTeach : true))
      .filter((s) => (subcategoryFilterTeach ? s.subcategory === subcategoryFilterTeach : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Search helper function: returns array of skill objects matching the search text in any of category/subcategory/skill name
// Normalize function: lowercase + replace dashes/underscores/commas with spaces + trim extra spaces
// Normalize strings: lowercase, replace special chars with spaces, collapse spaces, trim
const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/[-_.,]/g, " ")   // replace special chars with spaces
    .replace(/\s+/g, " ")      // collapse multiple spaces to single space
    .trim();

// Pre-normalize the aliasMap keys and values for faster lookups
const normalizedAliasMap = {};
for (const key in aliasMap) {
  const normalizedKey = normalize(key);
  normalizedAliasMap[normalizedKey] = aliasMap[key].map(normalize);
}

// Given a token, get that token plus all its aliases (if any)
const getAliasesForToken = (token) => {
  if (normalizedAliasMap[token]) {
    return [token, ...normalizedAliasMap[token]];
  }
  return [token];
};

const getSearchResults = (searchText) => {
  const normalizedSearch = normalize(searchText);
  if (!normalizedSearch) return [];

  // Split normalized search into tokens
  const searchTokens = normalizedSearch.split(" ");

  // Expand each token with aliases from the alias map
  const expandedTokens = searchTokens.flatMap(getAliasesForToken);

  // Filter skills where any expanded token matches category, subcategory, or name
  return skillsData.filter((s) => {
    const cat = normalize(s.category);
    const subcat = normalize(s.subcategory);
    const name = normalize(s.name);

    return expandedTokens.some(
      (token) => cat.includes(token) || subcat.includes(token) || name.includes(token)
    );
  }).slice(0, 20);  // limit to top 20 results
};


  // --- Handlers for Learn filters ---
  const handleCategoryChangeLearn = (cat) => {
    setCategoryFilterLearn(cat);
    setSubcategoryFilterLearn("");
    setTempSelectedLearn([]);
  };
  const handleSubcategoryChangeLearn = (subcat) => {
    setSubcategoryFilterLearn(subcat);
    setTempSelectedLearn([]);
  };

  // --- Handlers for Teach filters ---
  const handleCategoryChangeTeach = (cat) => {
    setCategoryFilterTeach(cat);
    setSubcategoryFilterTeach("");
    setTempSelectedTeach([]);
  };
  const handleSubcategoryChangeTeach = (subcat) => {
    setSubcategoryFilterTeach(subcat);
    setTempSelectedTeach([]);
  };

  // Add from multi-select temp to master selected list (Learn)
  const addSelectedLearn = () => {
    setSkillsToLearn((prev) => {
      const combined = [...prev];
      tempSelectedLearn.forEach((skillName) => {
        if (!combined.includes(skillName)) combined.push(skillName);
      });
      return combined;
    });
    setTempSelectedLearn([]);
  };

  // Add from multi-select temp to master selected list (Teach)
  const addSelectedTeach = () => {
    setSkillsToTeach((prev) => {
      const combined = [...prev];
      tempSelectedTeach.forEach((skillName) => {
        if (!combined.includes(skillName)) combined.push(skillName);
      });
      return combined;
    });
    setTempSelectedTeach([]);
  };

  // Remove skill from master list (Learn)
  const removeSkillLearn = (skillName) => {
    setSkillsToLearn((prev) => prev.filter((s) => s !== skillName));
  };

  // Remove skill from master list (Teach)
  const removeSkillTeach = (skillName) => {
    setSkillsToTeach((prev) => prev.filter((s) => s !== skillName));
  };

  // Add skill from search result to Learn master list
  const addSkillFromSearchLearn = (skillName) => {
    setSkillsToLearn((prev) => (prev.includes(skillName) ? prev : [...prev, skillName]));
    setSearchLearn("");
  };

  // Add skill from search result to Teach master list
  const addSkillFromSearchTeach = (skillName) => {
    setSkillsToTeach((prev) => (prev.includes(skillName) ? prev : [...prev, skillName]));
    setSearchTeach("");
  };

  // Dummy find matches function
  const findMatches = () => {
    if (skillsToLearn.length === 0 || skillsToTeach.length === 0) {
      alert("Please add at least one skill to learn and teach!");
      return;
    }

    setMatches([
      {
        id: 1,
        name: "Alice",
        teaches: skillsToTeach.join(", "),
        learns: skillsToLearn.join(", "),
      },
      {
        id: 2,
        name: "Bob",
        teaches: skillsToTeach.join(", "),
        learns: skillsToLearn.join(", "),
      },
    ]);
  };

  // Get search results arrays
  const searchResultsLearn = getSearchResults(searchLearn);
  const searchResultsTeach = getSearchResults(searchTeach);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 text-white flex flex-col items-center p-8">
      <header className="mb-12 text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">SkillSwap</h1>
        <p className="text-lg font-light drop-shadow-md">
          Connect, teach, and learn new skills by matching with people like you.
        </p>
      </header>

      <main className="w-full max-w-xl bg-white bg-opacity-10 rounded-3xl p-8 shadow-xl backdrop-blur-md overflow-auto">
        {/* Learn Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">Skills You Want to Learn</h2>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <select
              className="flex-1 rounded-lg p-2 text-gray-900 font-medium"
              value={categoryFilterLearn}
              onChange={(e) => handleCategoryChangeLearn(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="flex-1 rounded-lg p-2 text-gray-900 font-medium"
              value={subcategoryFilterLearn}
              onChange={(e) => handleSubcategoryChangeLearn(e.target.value)}
              disabled={!categoryFilterLearn}
            >
              <option value="">All Subcategories</option>
              {subcategoriesLearn.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>

          {/* Skills multi-select */}
          <select
            multiple
            className="w-full rounded-lg p-3 text-gray-900 font-medium h-32 mb-3"
            value={tempSelectedLearn}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, (opt) => opt.value);
              setTempSelectedLearn(selectedOptions);
            }}
            size={8}
          >
            {getFilteredSkillsLearn().map(({ id, name }) => (
              <option key={id} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={addSelectedLearn}
            className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-full font-semibold mb-2"
            disabled={tempSelectedLearn.length === 0}
          >
            Add Selected Learn Skills
          </button>

          {/* OR search below */}
          <p className="italic mb-2 text-purple-300">OR search a category, subcategory, or skill:</p>
          <input
            type="text"
            placeholder="Search here..."
            value={searchLearn}
            onChange={(e) => setSearchLearn(e.target.value)}
            className="w-full rounded-lg p-2 mb-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoComplete="off"
          />
          {searchLearn && searchResultsLearn.length > 0 && (
            <ul className="max-h-48 overflow-auto bg-purple-900 bg-opacity-80 rounded-lg mb-4 shadow-inner">
              {searchResultsLearn.map(({ id, category, subcategory, name }) => (
                <li
                  key={id}
                  onClick={() => addSkillFromSearchLearn(name)}
                  className="cursor-pointer px-3 py-2 hover:bg-purple-700 transition"
                  title={`Add ${name}`}
                >
                  <strong>{category}</strong> &gt; <em>{subcategory}</em> &gt; {name}
                </li>
              ))}
            </ul>
          )}

          {/* Selected skills list */}
          <div className="flex flex-wrap gap-2">
            {skillsToLearn.map((skill) => (
              <div
                key={skill}
                className="bg-purple-800 bg-opacity-70 rounded-full px-4 py-1 flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkillLearn(skill)}
                  className="text-purple-300 hover:text-white font-bold"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Teach Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Skills You Can Teach</h2>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <select
              className="flex-1 rounded-lg p-2 text-gray-900 font-medium"
              value={categoryFilterTeach}
              onChange={(e) => handleCategoryChangeTeach(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="flex-1 rounded-lg p-2 text-gray-900 font-medium"
              value={subcategoryFilterTeach}
              onChange={(e) => handleSubcategoryChangeTeach(e.target.value)}
              disabled={!categoryFilterTeach}
            >
              <option value="">All Subcategories</option>
              {subcategoriesTeach.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>

          {/* Skills multi-select */}
          <select
            multiple
            className="w-full rounded-lg p-3 text-gray-900 font-medium h-32 mb-3"
            value={tempSelectedTeach}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, (opt) => opt.value);
              setTempSelectedTeach(selectedOptions);
            }}
            size={8}
          >
            {getFilteredSkillsTeach().map(({ id, name }) => (
              <option key={id} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={addSelectedTeach}
            className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-full font-semibold mb-2"
            disabled={tempSelectedTeach.length === 0}
          >
            Add Selected Teach Skills
          </button>

          {/* OR search below */}
          <p className="italic mb-2 text-purple-300">OR search a category, subcategory, or skill:</p>
          <input
            type="text"
            placeholder="Search here..."
            value={searchTeach}
            onChange={(e) => setSearchTeach(e.target.value)}
            className="w-full rounded-lg p-2 mb-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoComplete="off"
          />
          {searchTeach && searchResultsTeach.length > 0 && (
            <ul className="max-h-48 overflow-auto bg-purple-900 bg-opacity-80 rounded-lg mb-4 shadow-inner">
              {searchResultsTeach.map(({ id, category, subcategory, name }) => (
                <li
                  key={id}
                  onClick={() => addSkillFromSearchTeach(name)}
                  className="cursor-pointer px-3 py-2 hover:bg-purple-700 transition"
                  title={`Add ${name}`}
                >
                  <strong>{category}</strong> &gt; <em>{subcategory}</em> &gt; {name}
                </li>
              ))}
            </ul>
          )}

          {/* Selected skills list */}
          <div className="flex flex-wrap gap-2">
            {skillsToTeach.map((skill) => (
              <div
                key={skill}
                className="bg-purple-800 bg-opacity-70 rounded-full px-4 py-1 flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkillTeach(skill)}
                  className="text-purple-300 hover:text-white font-bold"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Find Matches Button */}
        <button
          onClick={findMatches}
          className="w-full py-3 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition mt-10"
        >
          Find Matches
        </button>

        {/* Matches list */}
        <section className="mt-8">
          {matches.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
              <ul className="space-y-4">
                {matches.map(({ id, name, teaches, learns }) => (
                  <li
                    key={id}
                    className="bg-purple-800 bg-opacity-70 rounded-xl p-4 shadow-md hover:bg-purple-700 transition"
                  >
                    <p>
                      <strong>{name}</strong> teaches <em>{teaches}</em> and wants to learn <em>{learns}</em>.
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="italic text-purple-300 mt-6">Add skills and click "Find Matches" to see results.</p>
          )}
        </section>
      </main>

      <footer className="mt-auto text-purple-300 text-sm mt-12 mb-6">
        © 2025 SkillSwap — Made with 💜
      </footer>
    </div>
  );
}

export default App;
