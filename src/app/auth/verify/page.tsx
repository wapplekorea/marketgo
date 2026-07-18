export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">이메일을 확인해주세요</h1>
        <p className="text-sm text-gray-500">
          가입하신 이메일로 확인 링크를 발송했습니다.
          <br />
          링크를 클릭하면 로그인 후 대시보드로 이동합니다.
        </p>
      </div>
    </div>
  );
}
