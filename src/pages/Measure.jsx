import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mic } from "lucide-react";
import { useMicDb } from "../hooks/useMicDb.js";
import { dbColor, dbStatus, recommendedVolume } from "../data/line2.js";

const GAUGE_MIN = 30;
const GAUGE_MAX = 100;

export function Measure() {
  const navigate = useNavigate();
  const { db, status, start } = useMicDb();
  const [toastVisible, setToastVisible] = useState(false);

  function handleContribute() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  const roundedDb = db !== null ? Math.round(db) : null;
  const color = db !== null ? dbColor(db) : "#97C459";
  const gaugePercent =
    db !== null ? Math.min(Math.max(((db - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100, 0), 100) : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <header className="flex items-center gap-2 bg-white px-3 pt-6 pb-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="노선 뷰로 돌아가기"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">내 소음 측정</h1>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pt-10">
        {status === "idle" && (
          <>
            <Mic size={40} className="mb-4 text-gray-400" />
            <p className="mb-6 text-center text-sm text-gray-500">
              마이크로 주변 소음을 측정해 열차 dB 값을 보정해요. 측정값은 저장되지 않습니다.
            </p>
            <button
              type="button"
              onClick={start}
              className="w-full max-w-xs rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800"
            >
              측정 시작
            </button>
          </>
        )}

        {status === "requesting" && <p className="text-sm text-gray-400">마이크 권한 요청 중...</p>}

        {status === "denied" && (
          <>
            <p className="mb-2 text-center text-sm font-medium text-gray-700">
              마이크 권한이 거부되어 측정할 수 없어요
            </p>
            <p className="mb-6 text-center text-xs text-gray-400">
              주소창의 자물쇠 아이콘 → 권한에서 마이크를 허용한 뒤 다시 시도해주세요
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full max-w-xs rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800"
            >
              노선 뷰로 돌아가기
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="mb-6 text-center text-sm font-medium text-gray-700">
              마이크를 사용할 수 없어요. 잠시 후 다시 시도해주세요
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full max-w-xs rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800"
            >
              노선 뷰로 돌아가기
            </button>
          </>
        )}

        {status === "active" && (
          <div className="flex w-full max-w-xs flex-col items-center">
            <span className="text-6xl font-bold" style={{ color }}>
              {roundedDb ?? "--"}
              <span className="text-2xl align-top">dB</span>
            </span>
            <span
              className="mt-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${color}33`, color }}
            >
              {db !== null ? dbStatus(db) : ""}
            </span>
            <p className="mt-2 text-xs text-gray-400">기기 마이크 기반 근사치입니다</p>

            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${gaugePercent}%`, backgroundColor: color }}
              />
            </div>

            <p className="mt-4 text-sm font-medium text-gray-700">
              {db !== null ? recommendedVolume(db) : ""}
            </p>

            <button
              type="button"
              onClick={handleContribute}
              className="mt-8 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white active:bg-gray-800"
            >
              이 값을 열차에 기여
            </button>
          </div>
        )}
      </main>

      {toastVisible && (
        <div className="fixed inset-x-0 bottom-8 flex justify-center px-6">
          <div className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
            측정값이 반영되었어요 (데모)
          </div>
        </div>
      )}
    </div>
  );
}
