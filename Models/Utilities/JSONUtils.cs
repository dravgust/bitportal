using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace BitPortal.Models.Utilities
{
    public static class JsonExtentions 
    {
        public static string ToJSON(this object obj)
        {
            return JsonConvert.SerializeObject(obj);
        }
    }
}
