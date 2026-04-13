export default function EntrarPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa',
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'white',
          border: '1px solid #d2d9e5',
          borderRadius: 16,
          padding: 48,
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="22" stroke="#d2d9e5" strokeWidth="2" />
          <path
            d="M24 14v12M24 32v2"
            stroke="#abb3c4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#232831',
            lineHeight: 1.3,
          }}
        >
          Link inválido ou expirado
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 400,
            color: '#626c80',
            lineHeight: 1.6,
          }}
        >
          Solicite um novo link ao seu contato na Arco Educação.
        </p>
      </div>
    </div>
  );
}
