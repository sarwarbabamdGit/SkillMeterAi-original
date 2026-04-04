import { forwardRef } from 'react';

const Certificate = forwardRef(({ userName, courseTitle, completionDate, certificateId }, ref) => {
    return (
        <div
            ref={ref}
            className="relative w-[1056px] h-[816px] bg-gradient-to-br from-gray-50 to-white p-8 font-sans"
            style={{ fontFamily: 'Georgia, serif' }}
        >
            {/* Outer Border */}
            <div className="absolute inset-6 border-4 border-black rounded-lg" />

            {/* Inner Border */}
            <div className="absolute inset-8 border border-black rounded-lg" />

            {/* Logo - Top Left */}
            <img
                src="/logo.png"
                alt="SkillMeter Logo"
                className="absolute top-12 left-12 w-16 h-16 object-contain"
            />

            {/* Rocketboy - Bottom Right */}
            <img
                src="/Rocketboy.png"
                alt="Rocketboy"
                className="absolute bottom-16 right-12 w-32 h-32 object-contain"
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-16">
                {/* Header */}
                <h1 className="text-5xl font-bold text-gray-900 tracking-wide mb-2">
                    CERTIFICATE OF COMPLETION
                </h1>

                {/* Decorative Line */}
                <div className="w-96 h-0.5 bg-gray-400 mb-10" />

                {/* Certify Text */}
                <p className="text-xl text-gray-600 mb-4">This is to certify that</p>

                {/* User Name */}
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{userName}</h2>

                {/* Name Underline */}
                <div className="w-80 h-px bg-gray-400 mb-8" />

                {/* Completion Text */}
                <p className="text-xl text-gray-600 mb-4">has successfully completed the course</p>

                {/* Course Title */}
                <h3 className="text-3xl font-bold text-gray-800 mb-8">"{courseTitle}"</h3>

                {/* Completion Date */}
                <p className="text-lg text-gray-500 mb-12">Completed on {completionDate}</p>

                {/* Signature Lines */}
                <div className="flex justify-between w-full max-w-2xl mt-8">
                    <div className="text-center">
                        <div className="w-48 h-px bg-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Platform Director</p>
                    </div>
                    <div className="text-center">
                        <div className="w-48 h-px bg-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Date of Issue</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-16 left-0 right-0 text-center">
                    <p className="text-xs text-gray-400 mb-1">Certificate ID: {certificateId}</p>
                    <p className="text-sm font-bold text-gray-600">SkillMeter AI Learning Platform</p>
                </div>
            </div>
        </div>
    );
});

Certificate.displayName = 'Certificate';

export default Certificate;
