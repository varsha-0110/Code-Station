import illustration from "@/assets/illustration.svg"
import FormComponent from "@/components/forms/FormComponent"
import { useState, useEffect } from 'react';

function HomePage() {
  const [codeLines, setCodeLines] = useState([]);
  const [particles, setParticles] = useState([]);

  const codeContent = [
    { line: 1, content: '<span class="text-pink-400">function</span> <span class="text-blue-400">createAnimation</span>() {' },
    { line: 2, content: '  <span class="text-pink-400">const</span> <span class="text-cyan-400">elements</span> <span class="text-red-400">=</span> <span class="text-yellow-300">"coding magic"</span>;' },
    { line: 3, content: '  <span class="text-pink-400">for</span> (<span class="text-pink-400">let</span> <span class="text-cyan-400">i</span> <span class="text-red-400">=</span> <span class="text-yellow-300">0</span>; <span class="text-cyan-400">i</span> <span class="text-red-400">&lt;</span> <span class="text-cyan-400">elements</span>.<span class="text-blue-400">length</span>; <span class="text-cyan-400">i</span><span class="text-red-400">++</span>) {' },
    { line: 4, content: '    <span class="text-blue-400">animate</span>(<span class="text-cyan-400">elements</span>[<span class="text-cyan-400">i</span>]);' },
    { line: 5, content: '  }' },
    { line: 6, content: '  <span class="text-blue-400">// Magic happens here ✨</span>' },
    { line: 7, content: '  <span class="text-pink-400">return</span> <span class="text-yellow-300">"✨ Beautiful Code ✨"</span>;' },
    { line: 8, content: '}' },
    { line: 9, content: '' },
    { line: 10, content: '<span class="text-blue-400">// Execute the magic</span>' },
    { line: 11, content: '<span class="text-blue-400">createAnimation</span>();<span class="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-blink"></span>' }
  ];

  const createCodeLines = () => {
    setCodeLines([]);
    codeContent.forEach((line, index) => {
      setTimeout(() => {
        setCodeLines(prev => [...prev, { ...line, index }]);
      }, index * 300);
    });
  };

  const createParticle = () => {
    const id = Date.now() + Math.random();
    const particle = {
      id,
      left: Math.random() * 100,
      duration: Math.random() * 3 + 5,
      delay: Math.random() * 2
    };

    setParticles(prev => [...prev, particle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 8000);
  };

  useEffect(() => {
    createCodeLines();

    const particleInterval = setInterval(createParticle, 800);
    const restartInterval = setInterval(() => {
      createCodeLines();
    }, 15000);

    return () => {
      clearInterval(particleInterval);
      clearInterval(restartInterval);
    };
  }, []);

  return (
    <div 
      className="relative w-full h-screen flex items-center justify-center overflow-hidden font-mono"
    >
      {/* Floating Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[20%] right-[15%] text-2xl opacity-70 text-pink-400 animate-float" style={{ animationDelay: '0.5s' }}>{ }</div>
        <div className="absolute top-[20%] right-[15%] text-2xl opacity-70 text-cyan-400 animate-float" style={{ animationDelay: '1s' }}>&lt;/&gt;</div>
        <div className="absolute bottom-[15%] left-[20%] text-2xl opacity-70 text-blue-400 animate-float" style={{ animationDelay: '2s' }}>[ ]</div>
        <div className="absolute bottom-[10%] right-[10%] text-2xl opacity-70 text-yellow-300 animate-float" style={{ animationDelay: '3s' }}>( )</div>
      </div>

      {/* Particles */}
      <div className="absolute w-full h-full">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-particle-float"
            style={{
              left: `${particle.left}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Main Content: Form + Editor */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Left: Form */}
        <div className="w-full h-[70%] sm:w-1/2 flex justify-center pr-[50px] mr-[50px] border-t-[5px] border-t-transparent border-r-[5px] border-r-blue-400">
          <FormComponent />
        </div>

        {/* Right: Code Animation Editor */}
        <div className="w-full sm:w-1/2 flex justify-center">
          <div className="w-[700px] h-[400px] bg-gray-900 bg-opacity-90 rounded-xl border-2 border-blue-400 overflow-hidden relative animate-editor-glow ring-1 ring-blue-400/30 shadow-blue-500/20">
            {/* Editor Header */}
            <div className="bg-gray-800 h-10 flex items-center px-5 border-b border-gray-600">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse-custom"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse-custom"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse-custom"></div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="p-5 h-[calc(100%-2.5rem)] overflow-hidden">
              {codeLines.map((line, index) => (
                <div 
                  key={`${line.line}-${line.index}`}
                  className="flex items-center mb-2 opacity-0 animate-type-in"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <span className="text-gray-500 w-8 text-right mr-5 text-sm">{line.line}</span>
                  <span 
                    className="text-white text-sm"
                    dangerouslySetInnerHTML={{ __html: line.content }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
