
import React from 'react';
import { Shield, Book, Globe, Star } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-amiri font-bold text-[#d4af37]">حول تطبيق أوقات رمضان</h2>
        <p className="text-gray-400 text-lg">المنصة المتكاملة لمواقيت الصلاة وإمساكية شهر رمضان المبارك بدقة واحترافية.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-3xl text-center space-y-4 border border-white/5">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
            <Globe size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">بيانات موثوقة</h3>
          <p className="text-gray-400 text-sm">نعتمد على أدق مصادر البيانات العالمية (AlAdhan API) لتوفير مواقيت دقيقة بناءً على موقعك الجغرافي.</p>
        </div>

        <div className="glass p-8 rounded-3xl text-center space-y-4 border border-white/5">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto text-green-500">
            <Shield size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">خصوصية وأمان</h3>
          <p className="text-gray-400 text-sm">بياناتك وإعداداتك مشفرة ومحفوظة محلياً على جهازك فقط. نحن نولي خصوصيتك الأولوية القصوى.</p>
        </div>

        <div className="glass p-8 rounded-3xl text-center space-y-4 border border-white/5 md:col-span-2 lg:col-span-1">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto text-yellow-500">
            <Star size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">تجربة متميزة</h3>
          <p className="text-gray-400 text-sm">تصميم عصري يجمع بين جمالية التراث الرمضاني وسهولة الاستخدام التقنية الحديثة.</p>
        </div>
      </div>

      <section className="glass p-10 rounded-3xl space-y-8 border border-white/5">
        <div>
          <h3 className="text-2xl font-bold text-[#d4af37] mb-4 flex items-center gap-2">
            <Book className="text-[#d4af37]" /> شروط الاستخدام والخصوصية
          </h3>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>• تطبيق <b>أوقات رمضان</b> هو تطبيق مستقل مخصص لتوفير المعلومات الدينية والزمنية للمستخدم.</p>
            <p>• يتم تخزين تفضيلات المستخدم (مثل المدينة وطريقة الحساب) في الذاكرة المحلية للتطبيق لضمان استمرارية التجربة دون الحاجة لإعادة الإعداد.</p>
            <p>• التطبيق لا يقوم بجمع أي بيانات شخصية أو تتبع الموقع الجغرافي في الخلفية دون إذن صريح ومباشر من المستخدم.</p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <h3 className="text-2xl font-bold text-white mb-6">المواصفات التقنية</h3>
          <div className="flex flex-wrap gap-3">
            {['React Professional', 'Enterprise TypeScript', 'Tailwind UX', 'PWA Ready', 'Secure LocalStorage'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-white/5 rounded-full text-gray-400 text-sm border border-white/10">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center pt-8 text-gray-500 text-sm">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} أوقات رمضان</p>
        <p className="mt-2 text-[10px] opacity-40">الإصدار v1.2.0 - نظام حماية البيانات المحلي مفعل</p>
      </div>
    </div>
  );
};

export default About;
